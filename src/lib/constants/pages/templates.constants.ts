import { BreadcrumbItem } from "@components/shared/atoms/Breadcrumb";
import { FilterItemConfig } from "@components/shared/molecules/FilterItem";
import { TableRow } from "@components/shared/organisms/DataTable";
import { Template } from "@type/api/template.type";
import { ColumnType, TableColumn } from "@type/component/table.type";

export const TEMPLATES_BREADCRUMBS: BreadcrumbItem[] = [
	{
		key: "templates_page",
		label: "templates_page.title",
	},
];

export const TABLE_TEMPLATES_COLUMN: TableColumn<TableRow>[] = [
	{
		key: "name",
		dataType: ColumnType.TEXT,
		label: "templates_page.name",
	},
	{
		key: "content",
		dataType: ColumnType.TEXT,
		label: "templates_page.content",
	},
];

export const TEMPLATES_FILTERS: Record<string, FilterItemConfig> = {
	createdDate: {
		icon: "Clock",
		name: "templates_page.created_date",
		type: "date",
	},
};

export const DEFAULT_TEMPLATE: Template = {
	name: "",
	content: "",
	brand_id: "",
	id: "",
	created_at: "",
	created_by: "",
	updated_at: "",
	updated_by: "",
};
