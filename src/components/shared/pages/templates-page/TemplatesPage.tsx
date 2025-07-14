'use client'

import { DefaultPageLayout } from "@components/shared/templates"
import { BreadcrumbItem } from "@components/shared/atoms/Breadcrumb";
import { TableColumn, ColumnType } from "@type/component/table.type";
import DataTable, { TableRow } from "@components/shared/organisms/DataTable";
import { Template, TemplateBody, TemplateQueryParams } from "@type/api/template.type";
import { useTranslations } from "next-intl";
import { ActionMenu, InputSearch } from "@components/shared/atoms";
import { useCallback, useMemo, useState, useEffect } from "react";
import { FilterItemConfig } from "@components/shared/molecules/FilterItem";
import { Button, ConfirmModal, Filter, Pagination } from "@components/shared/molecules";
import { RefreshCcw, SquarePen, Trash2 } from "lucide-react";
import parse from "html-react-parser"
import { apiCreateTemplate, apiDeleteTemplate, apiGetTemplate, apiUpdateTemplate } from "@api/template";
import { toast } from "react-toastify";
import AddTemplateModal from "@components/non-shared/templates/AddTemplatesModal";
import { object } from "yup";
import { ApiResponse } from "@type/api.type";

const TemplatesPage = () => {
    const TEMPLATES_BREADCRUMBS: BreadcrumbItem[] = [
        {
            key: "templates_page",
            label: "templates_page.title",
        }
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
            label: "templates_page.content"
        },
    ];

    const TEMPLATES_FILTERS: Record<string, FilterItemConfig> = {
        createdDate: {
            icon: "Clock",
            name: "templates_page.created_date",
            type: "date",
        }
    }

    const DEFAULT_TEMPLATES: Template = {
        name: "",
        content: "",
        brand_id: "",
        id: "",
        created_at: "",
        created_by: "",
        updated_at: "",
        updated_by: ""
    }

    // Hooks
    const t = useTranslations();

    //State
    const [page, setPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(20)
    const [templateName, setTemplateName] = useState<string>("");
    const [params, setParams] = useState<Record<string, any>>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSelectAll, setIsSelectAll] = useState<boolean>(false);
    const [totalItem, setTotalItem] = useState<number>(0);
    const [notSelectedTemplates, setNotSelectedTemplates] = useState<TableRow[]>([]);
    const [selectedTemplate, setSelectedTempate] = useState<Template>(DEFAULT_TEMPLATES)
    const [selectedTemplates, setSelectedTemplates] = useState<TableRow[]>([]);
    const [dataTable, setDataTable] = useState<TableRow[]>([]);
    const [addTemplateModalOpen, setAddTemplateModalOpen] = useState<boolean>(false);
    const [deleteTemplateModalOpen, setDeleteTemplateModalOpen] = useState<boolean>(false);

    //Memoized
    const filters = useMemo(() => TEMPLATES_FILTERS, []);

    // Handel get templates
    const handleGetTemplates = useCallback(async () => {
        try {
            setIsLoading(true);
            const queryParams: TemplateQueryParams = {
                ...(templateName && { name: templateName }),
                ...params,
                limit: pageSize,
                offset: (page - 1) * pageSize || 0
            };
            const response = await apiGetTemplate(queryParams);
            if (response.code !== "OK") {
                return toast.error(
                    t("api.get.failed", { data: t("templates_page.templates_list").toLowerCase() })
                );
            }

            const { data, total } = response;
            setDataTable(data);
            setTotalItem(total ?? 0);
        }

        catch (error) {
            toast.error(t("api.get.failed", { data: t("templates_page.template_list").toLowerCase() }));
        }
        finally {
            setIsLoading(false);
            setSelectedTempate(DEFAULT_TEMPLATES);
        }
    }, [params, page, pageSize, templateName])

    // Handle Async Data
    const handleSyncData = useCallback(() => {
        handleGetTemplates();
    }, [params, page, pageSize]);

    const handleAddTemplate = useCallback(
        async (body: TemplateBody) => {
            let response: ApiResponse<Template>;

            try {
                if (selectedTemplate.id) {
                    response = await apiUpdateTemplate(selectedTemplate.id, body);
                } else {
                    response = await apiCreateTemplate(body);
                }

                if (response.code !== "OK") {
                    toast.error(
                        t(`api.${selectedTemplate.id ? "update" : "create"}.failed`, { data: body.name })
                    );
                    return response;
                }

                handleGetTemplates();
                toast.success(
                    t(`api.${selectedTemplate.id ? "update" : "create"}.success`, { data: body.name })
                );
                setAddTemplateModalOpen(false);
                return response;
            } catch (error) {
                toast.error(t(`api.${selectedTemplate.id ? "update" : "create"}.failed`, { data: body.name }));
                return null;
            }
        },
        [selectedTemplate]
    );

    const handleSelectedAll = useCallback(
        (value: boolean) => {
            setIsSelectAll(value);
            if (value) {
                setSelectedTemplates(dataTable);
            } else {
                setSelectedTemplates([]);
            }
        },
        [dataTable]
    );

    /** Handle Edit Templates
     * @param row TableRow
     */
    const handleEditTemplates = useCallback((row: TableRow) => {
        setSelectedTempate(row as Template);
        setAddTemplateModalOpen(true);
    }, [])

    //Handle Delete Template
    const handleDeleteTemplate = useCallback(async () => {
        try {
            const response = await apiDeleteTemplate(selectedTemplate.id);

            if (response.code !== "OK") {
                toast(t("api.delete.failed", { data: selectedTemplate.name }));
                return;
            }

            toast.success(t("api.delete.success", { data: selectedTemplate.name }));
            handleSyncData();

            setDeleteTemplateModalOpen(false);
        }
        catch (error) {
            toast.error(t("api.delete.failed", { data: selectedTemplate.name }));
        }
    }, [selectedTemplate])

    useEffect(() => {
        handleGetTemplates();
    }, [page, pageSize, params, templateName]);


    return (
        <DefaultPageLayout breadcrumbs={TEMPLATES_BREADCRUMBS}>
            <div className="flex flex-col gap-2 mt-2">
                {/* Area: Right action */}
                <div className="flex justify-between gap-2">
                    <div className="flex gap-2">
                        {/* Area input search */}
                        <InputSearch
                            minLength={2}
                            value={templateName}
                            placeholder="templates_page.search_template"
                            onChange={setTemplateName}
                            onSearch={handleGetTemplates}
                        />

                        {/* Area: Filter */}
                        <Filter
                            param={params}
                            filters={filters}
                            onParamChange={setParams}
                            onFilter={handleGetTemplates}
                        />
                    </div>

                    {/* Area: Left Action */}
                    <div className=" flex gap-2">
                        {/* Area: Add template */}
                        <Button size="sm" onClick={() => {
                            setSelectedTempate(DEFAULT_TEMPLATES);
                            setAddTemplateModalOpen(true);
                        }}>
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
                                }
                            ]}
                        />
                    </div>
                </div>

                {/* Area: Count Template */}
                <span>
                    {parse(
                        t("templates_page.selected_template", {
                            number: `<b className= 'text-primary-500'>${isSelectAll ? totalItem - notSelectedTemplates.length : (selectedTemplates.length ?? 0)} </b>`,
                        })
                    )}
                </span>
                <DataTable
                    id="templates_table"
                    showAction
                    data={dataTable}
                    showActionColumn
                    currentPage={page}
                    totalItem={totalItem}
                    isLoading={isLoading}
                    columns={TABLE_TEMPLATES_COLUMN}
                    selectedList={selectedTemplates}
                    notSelectedList={notSelectedTemplates}
                    selectedAll={isSelectAll}
                    actionColumnOptions={[
                        {
                            label: "form.edit",
                            icon: <SquarePen size={16} />,
                            className: "text-primary-500",
                            onClick: handleEditTemplates,
                        },
                        {
                            label: "form.delete",
                            icon: <Trash2 size={16} />,
                            className: "text-danger-500",
                            onClick: (row) => {
                                setSelectedTempate(row as Template);
                                setDeleteTemplateModalOpen(true);
                            }
                        },
                    ]}
                    onSelectRow={(rows) => setSelectedTemplates(rows)}
                    onSelectAll={handleSelectedAll}
                    onDeselectRow={(rows) => setSelectedTemplates(rows)}


                />

                {/* Area Pagination */}
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

            {addTemplateModalOpen && (
                <>
                  <AddTemplateModal
                        brand={selectedTemplate.brand_id}
                        isOpen={addTemplateModalOpen}
                        isEdit={
                            selectedTemplate.brand_id.length > 0
                                ? true : false
                        }
                        templateContent={selectedTemplate.content}
                        templateName={selectedTemplate.name}
                        onSubmit={handleAddTemplate}
                        setIsOpen={setAddTemplateModalOpen}
                    />
                </>
            )}

            {deleteTemplateModalOpen && (
                <>
                    {deleteTemplateModalOpen && (
                        <ConfirmModal
                            isOpen={deleteTemplateModalOpen}
                            setIsOpen={setDeleteTemplateModalOpen}
                            title={t("templates_page.delete_template_modal.title")}
                            confirmLabel={t("templates_page.delete_template_modal.confirm_button")}
                            cancelLabel={t("templates_page.delete_template_modal.cancel_button")}
                            onConfirm={handleDeleteTemplate}
                            onCancel={() => setDeleteTemplateModalOpen(false)}
                        >
                            <label>{t("templates_page.delete_template_modal.message")}</label>
                        </ConfirmModal>
                    )}
                </>)}
        </DefaultPageLayout>
    )

}
export default TemplatesPage