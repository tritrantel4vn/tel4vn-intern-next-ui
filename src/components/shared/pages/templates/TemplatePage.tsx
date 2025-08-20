"use client";

import { apiDeleteBrand, apiGetBrands } from "@api/brand";
import { ActionMenu, Chip, InputSearch, RangeDatePicker } from "@components/shared/atoms";
import { BreadcrumbItem } from "@components/shared/atoms/Breadcrumb";
import { Button, ConfirmModal, Filter, Pagination } from "@components/shared/molecules";
import { FilterItemConfig } from "@components/shared/molecules/FilterItem";
import { DataTable } from "@components/shared/organisms";
import { TableRow } from "@components/shared/organisms/DataTable";
import { DefaultPageLayout } from "@components/shared/templates";
import { ApiResponse } from "@type/api.type";
import { ColumnType, TableColumn } from "@type/component/table.type";
import parse from "html-react-parser";
import { RefreshCcw, SquarePen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { DateRange } from "react-day-picker";
import { Template, TemplateBody } from "@type/api/template.type";
import { apiCreateTemplate, apiGetTemplates, apiUpdateTemplate } from "@api/template";
import AddTemplateModal from "@components/non-shared/templates/AddTemplateModal";

/**
 * Template Page
 */
const TemplatePage = () => {
	// Constants
	const TEMPLATES_BREADCRUMBS: BreadcrumbItem[] = [
		{
			key: "template_page",
			label: "templates_page.title",
		},
	];
	const TABLE_TEMPLATES_COLUMN: TableColumn<TableRow>[] = [
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
	const TEMPLATE_FILTERS: Record<string, FilterItemConfig> = {
		create: {
			icon: "Timer",
			name: "templates_page.create",
			type: "date",
			keyStart: "created_from",
			keyEnd: "created_to",
		},
	};
	const DEFAULT_TEMPLATE: Template = {
		name: "",
		content: "",
		brand_id: "",
		id: "",
		brand: "",
		created_at: "",
		created_by: "",
		updated_at: "",
		updated_by: "",
	};

	// Hooks
	const t = useTranslations();

	// States
	const [page, setPage] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(20);
	const [totalItem, setTotalItem] = useState<number>(0);
	const [brandName, setBrandName] = useState<string>("");
	const [templateName, setTemplateName] = useState<string>("");
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [dataTable, setDataTable] = useState<TableRow[]>([]);
	const [params, setParams] = useState<Record<string, any>>({});
	const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
	const [selectedBrands, setSelectedBrands] = useState<TableRow[]>([]);
	const [selectedTemplate, setSelectedTemplate] = useState<Template>(DEFAULT_TEMPLATE);
	const [addTemplateModalOpen, setAddTemplateModalOpen] = useState<boolean>(false);
	const [notSelectedBrands, setNotSelectedBrands] = useState<TableRow[]>([]);
	const [deleteBrandModalOpen, setDeleteBrandModalOpen] = useState<boolean>(false);
	const [selectDate, setSelectDate] = useState<DateRange | undefined>();

	// Memoized
	const filters = useMemo(() => TEMPLATE_FILTERS, []);

	// handle selectDate

	const handleSelectDate = useCallback((date: DateRange) => {
		console.log("User selected:", date);
		setSelectDate(date);
	}, []);

	/**
	 * Handle get brands
	 */

	// handle get template
	const handleGetTemplates = useCallback(async () => {
		try {
			setIsLoading(true);
			// get list of brands
			const listBrand = await apiGetBrands({ limit: 100, offset: 0 });
			if (listBrand.code !== "OK") {
				toast.error(t("api.get.failed", { data: "brand" }));
				return;
			}

			const brandIds = listBrand.data.map((b) => b.id);

			// map temaple for each brand
			const templateResponse = await Promise.all(
				brandIds.map((id) => apiGetTemplates({ brand_id: id }))
			);

			// merge  templates data

			const allTemplates = templateResponse.flatMap((res) => (res.code === "OK" ? res.data : []));

			const start = (page - 1) * pageSize;
			const end = start + pageSize;
			setDataTable(allTemplates.slice(start, end));
			setTotalItem(allTemplates.length);
			console.log("total length", allTemplates.length);
		} catch (error) {
			toast.error(t("api.get.failed", { data: "templates" }));
		} finally {
			setIsLoading(false);
		}
	}, [params, page, pageSize, templateName]);

	/**
	 * Handle open create brand modal
	 */
	const handleOpenCreateTemplateModal = useCallback(() => {
		setSelectedTemplate(DEFAULT_TEMPLATE);
		setAddTemplateModalOpen(true);
	}, []);

	/**
	 * Handle open delete modal
	 * @param row TableRow
	 */
	const handleOpenDeleteModal = useCallback((row: TableRow) => {
		setSelectedBrands([row]);
		setDeleteBrandModalOpen(true);
	}, []);

	/**
	 * Handle select all
	 * @param value boolean
	 */
	const handleSelectedAll = useCallback(
		(value: boolean) => {
			setIsSelectAll(value);
			if (value) {
				setSelectedBrands(dataTable);
			} else {
				setSelectedBrands([]);
			}
		},
		[dataTable]
	);

	/**
	 * Handle add brand
	 * @param body BrandBody
	 */
	const handleAddTemplate = useCallback(
		async (body: TemplateBody) => {
			let response: ApiResponse<Template>;

			try {
				if (selectedTemplate.id) {
					// Update
					response = await apiUpdateTemplate(selectedTemplate.id, body);
				} else {
					// Create
					response = await apiCreateTemplate(body);
				}

				if (response.code !== "OK") {
					toast.error(
						t(`api.${selectedTemplate.id ? "update" : "create"}.failed`, { data: body.name })
					);
					return;
				}

				handleGetTemplates();
				toast.success(
					t(`api.${selectedTemplate.id ? "update" : "create"}.success`, { data: body.name })
				);
				setAddTemplateModalOpen(false);
			} catch (error) {
				toast.error(
					t(`api.${selectedTemplate.id ? "update" : "create"}.failed`, { data: body.name })
				);
			}
		},
		[selectedTemplate]
	);

	/**
	 * Handle sync data
	 */
	const handleSyncData = useCallback(() => {
		handleGetTemplates();
	}, [params, page, pageSize, brandName]);

	/**
	 * Handle edit brand click
	 * @param row TableRow
	 */
	const handleEditBrandClick = useCallback((row: TableRow) => {
		setSelectedTemplate(row as Template);
		setAddTemplateModalOpen(true);
	}, []);

	/**
	 * Handle delete brand
	 */ RangeDatePicker;
	const handleDeleteBrand = useCallback(async () => {
		try {
			const response = await apiDeleteBrand(selectedTemplate.id);

			if (response.code !== "OK") {
				toast.error(t("api.delete.failed", { data: selectedTemplate.name }));
				return;
			}

			toast.success(t("api.delete.success", { data: selectedTemplate.name }));
			handleGetTemplates();
		} catch (error) {
			toast.error(t("api.delete.failed", { data: selectedTemplate.name }));
		}
	}, [selectedTemplate]);

	useEffect(() => {
		handleGetTemplates();
	}, [page, pageSize, params]);

	return (
		<DefaultPageLayout breadcrumbs={TEMPLATES_BREADCRUMBS}>
			<div className="mt-2 flex flex-col gap-2">
				{/* Area: Right Action */}
				<div className="flex justify-between gap-2">
					<div className="flex gap-2">
						{/* Area: Input Search */}
						<InputSearch
							minLength={2}
							value={brandName}
							placeholder="brands_page.search_brand"
							onChange={setBrandName}
							onSearch={handleGetTemplates}
						/>

						{/* Area: Clendar */}
						<Filter
							param={params}
							filters={filters}
							onParamChange={setParams}
							////////////////////////
							onFilter={handleGetTemplates}
						/>
					</div>

					{/* Area: Left Action */}
					<div className="flex gap-2">
						{/* Area: Add Template */}
						<Button size="sm" onClick={handleOpenCreateTemplateModal}>
							{t("templates_page.add_new_template")}
						</Button>

						{/* Area: Action Menu */}
						<ActionMenu
							label="form.other_action"
							actions={[
								{
									icon: RefreshCcw,
									key: "sync-data",
									label: "sync_data",
									action: handleSyncData,
								},
							]}
						/>
					</div>
				</div>

				{/* Area: Count Brands */}
				<span>
					{parse(
						t("brands_page.selected_brand", {
							number: `<b className='text-primary-500'>${isSelectAll ? totalItem - notSelectedBrands.length : (selectedBrands.length ?? 0)}</b>`,
						})
					)}
				</span>

				{/* Area: Table Lead */}
				<DataTable
					id="templates-table"
					showAction
					data={dataTable}
					showActionColumn
					currentPage={page}
					pageSize={pageSize}
					totalItem={totalItem}
					isLoading={isLoading}
					columns={TABLE_TEMPLATES_COLUMN}
					selectedList={selectedBrands}
					notSelectedList={notSelectedBrands}
					selectedAll={isSelectAll}
					actionColumnOptions={[
						{
							label: "form.edit",
							icon: <SquarePen size={16} />,
							className: "text-primary-500",
							onClick: handleEditBrandClick,
						},
						{
							label: "form.delete",
							icon: <Trash2 size={16} />,
							className: "text-danger-500",
							onClick: handleOpenDeleteModal,
						},
					]}
					onSelectRow={setSelectedBrands}
					onSelectAll={handleSelectedAll}
					onDeselectRow={setNotSelectedBrands}
				/>

				{/* Area: Pagination */}
				{dataTable.length > 0 && (
					<Pagination
						currentPage={page}
						pageSize={pageSize}
						totalItem={totalItem}
						setPage={setPage}
						setPageSize={setPageSize}
					/>
				)}
			</div>

			{/* Area: Add Brand Modal */}
			{addTemplateModalOpen && (
				<AddTemplateModal
					template={selectedTemplate}
					isOpen={addTemplateModalOpen}
					onSubmit={handleAddTemplate}
					setIsOpen={setAddTemplateModalOpen}
				/>
			)}

			{/* Area: Confirm Delete Brand Modal */}
			<ConfirmModal
				state="warning"
				title={t("templates_page.delete_template_modal.title")}
				isOpen={deleteBrandModalOpen}
				setIsOpen={setDeleteBrandModalOpen}
				confirmLabel={t("form.delete")}
				onConfirm={handleDeleteBrand}
			>
				{t("templates_page.delete_template_modal.message")}
			</ConfirmModal>
		</DefaultPageLayout>
	);
};

export default TemplatePage;
