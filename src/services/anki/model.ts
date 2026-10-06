import type { AnkiModel, AnkiModelTemplate } from "@common/types";
import * as z from "zod";
import { ANKI_MODEL, ANKI_TEXT_MODEL } from "./builtin";
import type { AnkiRequest } from "./request";

const emptyResultSchema = z.null().transform(() => undefined);
const modelSchema = z.record(z.string(), z.unknown());
const modelStylingSchema = z.object({ css: z.string() });
const modelTemplatesSchema = z.record(
  z.string(),
  z.object({ Front: z.string(), Back: z.string() }),
);
const stringArraySchema = z.array(z.string());

export async function checkModel(
  request: AnkiRequest,
  model: AnkiModel,
  marker: string,
): Promise<void> {
  const fields = new Set(await getModelFields(request, model.modelName));
  if (!model.inOrderFields.every((field) => fields.has(field)))
    throw new Error(`${model.modelName} is missing required fields. Please run Setup Template.`);
  if (!(await getModelStyling(request, model.modelName)).css.includes(marker))
    throw new Error(`${model.modelName} template is out of date. Please run Setup Template.`);
  const templates = await request("modelTemplates", modelTemplatesSchema, {
    modelName: model.modelName,
  });
  if (!model.cardTemplates.every(({ Name }) => Name in templates))
    throw new Error(`${model.modelName} card types are out of date. Please run Setup Template.`);
}

export async function syncModel(request: AnkiRequest): Promise<void> {
  const models = await getModels(request);
  for (const model of [ANKI_MODEL, ANKI_TEXT_MODEL]) {
    await (models.includes(model.modelName)
      ? updateModel(request, model)
      : createModel(request, model));
  }
}

function getModels(request: AnkiRequest): Promise<string[]> {
  return request("modelNames", stringArraySchema);
}

async function createModel(request: AnkiRequest, model: AnkiModel): Promise<void> {
  await request("createModel", modelSchema, { ...model });
}

async function updateModel(request: AnkiRequest, model: AnkiModel): Promise<void> {
  const currentFields = await getModelFields(request, model.modelName);
  await addMissingModelFields(request, model.modelName, currentFields, model.inOrderFields);
  await removeExtraModelFields(request, model.modelName, currentFields, model.inOrderFields);
  await repositionModelFields(request, model.modelName, model.inOrderFields);

  await updateModelTemplates(request, model.modelName, model.cardTemplates);
  await updateModelStyling(request, model.modelName, model.css);
}

function getModelFields(request: AnkiRequest, modelName: string): Promise<string[]> {
  return request("modelFieldNames", stringArraySchema, { modelName });
}

function getModelStyling(request: AnkiRequest, modelName: string): Promise<{ css: string }> {
  return request("modelStyling", modelStylingSchema, { modelName });
}

async function addMissingModelFields(
  request: AnkiRequest,
  modelName: string,
  currentFields: string[],
  nextFields: string[],
): Promise<void> {
  const currentFieldSet = new Set(currentFields);
  for (const fieldName of nextFields.filter((field) => !currentFieldSet.has(field))) {
    await request("modelFieldAdd", emptyResultSchema, { modelName, fieldName });
  }
}

async function removeExtraModelFields(
  request: AnkiRequest,
  modelName: string,
  currentFields: string[],
  nextFields: string[],
): Promise<void> {
  const nextFieldSet = new Set(nextFields);
  for (const fieldName of currentFields.filter((field) => !nextFieldSet.has(field))) {
    await request("modelFieldRemove", emptyResultSchema, { modelName, fieldName });
  }
}

async function repositionModelFields(
  request: AnkiRequest,
  modelName: string,
  fields: string[],
): Promise<void> {
  for (const [index, fieldName] of fields.entries()) {
    await request("modelFieldReposition", emptyResultSchema, { modelName, fieldName, index });
  }
}

function updateModelStyling(request: AnkiRequest, modelName: string, css: string): Promise<void> {
  return request("updateModelStyling", emptyResultSchema, {
    model: { name: modelName, css },
  });
}

async function updateModelTemplates(
  request: AnkiRequest,
  modelName: string,
  templates: AnkiModelTemplate[],
): Promise<void> {
  const current = await request("modelTemplates", modelTemplatesSchema, { modelName });
  const legacyNames =
    modelName === ANKI_MODEL.modelName ? ["OneDict", "Word"] : ["OneDict AI", "Text"];
  for (const { Name } of templates) {
    if (Name in current) continue;
    const legacyName = legacyNames.find((name) => name in current);
    if (!legacyName) throw new Error(`${modelName} is missing its card template: ${Name}.`);
    await request("modelTemplateRename", emptyResultSchema, {
      modelName,
      oldTemplateName: legacyName,
      newTemplateName: Name,
    });
  }
  return request("updateModelTemplates", emptyResultSchema, {
    model: {
      name: modelName,
      templates: Object.fromEntries(
        templates.map(({ Name, Front, Back }) => [Name, { Front, Back }]),
      ),
    },
  });
}
