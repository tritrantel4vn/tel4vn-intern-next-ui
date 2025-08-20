import { TemplateBody } from './../type/api/template.type';

import { ApiResponse } from "@type/api.type";
import { Template,TemplateQueryParams} from "@type/api/template.type";
import { apiDelete, apiGet, apiPost, apiPut } from "@utils/config-api";

const SUB_PATH = "/sns/templates";

/**
 * Api get brands
 * @param params TemplateQueryParams
 * @returns ApiResponse<Template[]>
 */
export const apiGetTemplates = async (params?: TemplateQueryParams) => {
	return await apiGet<ApiResponse<Template[]>>({
		params,
		token: "",
		url: SUB_PATH,
	});
};

/**
 * Api create brand
 * @param body BrandBody
 * @returns ApiResponse<Brand>
 */
export const apiCreateTemplate = async (body: TemplateBody) => {
	return await apiPost<ApiResponse<Template>>({
		body: JSON.stringify(body),
		token: "",
		url: SUB_PATH,
	});
};

/**
 * Api update brand
 * @param id string
 * @param body BrandBody
 * @returns ApiResponse<Brand>
 */
export const apiUpdateTemplate = async (id: string, body: TemplateBody) => {
	return await apiPut<ApiResponse<Template>>({
		body: JSON.stringify(body),
		token: "",
		url: `${SUB_PATH}/${id}`,
	});
};

/**
 * Api delete brand
 * @param id string
 * @returns ApiResponse<null>
 */
export const apiDeleteTemplate = async (id: string) => {
	return await apiDelete<ApiResponse<null>>({
		token: "",
		url: `${SUB_PATH}/${id}`,
	});
};
