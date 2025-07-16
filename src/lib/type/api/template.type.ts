import { AuditInfo, Param } from "@type/common.type";

export type Template = {
    brand_id: string;
    name: string;
    content: string;
    params: string[];
} & AuditInfo;

export type TemplateQueryParams = {
    brand?: string;
} & Param;