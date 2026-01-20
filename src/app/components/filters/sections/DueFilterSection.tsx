import React from 'react'
import FilterSection from '../FilterSection'
import { useTranslations } from 'next-intl'
import FilterButton from '../FilterButton'
import { useFilters } from '@/src/app/providers/filters/useFilters'
import { dateRangeFunctions } from '@/src/app/utils/dateRange'
import { DatePicker } from '@mui/x-date-pickers'

export default function DueFilterSection() {
    const t = useTranslations("DueFilterSection")
    const { selectedDueDateRange, toggleDateRange } = useFilters()
    {/* TODO add error handling for if the date range is inverted */ }

    return (
        <div>
            <FilterSection title="Due Date">
                <div className='flex flex-col gap-1'>
                    <div className='flex flex-row gap-1'>
                        {Array.from({ length: 3 }, (_, index) => (
                            <FilterButton
                                key={index}
                                label={t('due-filter-' + (index + 1))}
                                color={index === selectedDueDateRange.rangeSelected ? "warning" : "default"}
                                onClick={() => {
                                    const { startDate, endDate } = dateRangeFunctions[index]()
                                    toggleDateRange({
                                        startDate,
                                        endDate,
                                        rangeSelected: index
                                    })
                                }}
                            />
                        ))}
                    </div>
                    <p className="text-chip-info text-dark-green-1 dark:text-dark-green-1">{t("from-filter-title")}</p>
                    <DatePicker
                        value={selectedDueDateRange.startDate}
                        onChange={(newStartDate) => {
                            toggleDateRange({
                                ...selectedDueDateRange,
                                startDate: newStartDate
                            })
                        }}
                        slotProps={{

                            textField: {
                                sx: {
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "var(--input-bg)",
                                        color: "var(--input-text)",
                                        "& fieldset": {
                                            borderColor: "var(--input-border)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "var(--Green-2)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "var(--Green-1) !important",
                                        },
                                        "& .MuiInputAdornment-root .MuiIconButton-root": {
                                            color: "var(--input-text)",
                                        },
                                    },
                                    "& .MuiInputLabel-root": {
                                        color: "var(--input-text)",
                                    },
                                },
                            },
                            openPickerIcon: {
                                sx: {
                                    color: "var(--input-text)",
                                },
                            },
                        }}
                    />
                    <p className="text-chip-info text-dark-green-1 dark:text-dark-green-1">{t("to-filter-title")}</p>
                    <DatePicker
                        value={selectedDueDateRange.endDate}
                        onChange={(newEndDate) => {
                            toggleDateRange({
                                ...selectedDueDateRange,
                                endDate: newEndDate
                            })
                        }}
                        slotProps={{
                            textField: {
                                sx: {
                                    "& .MuiOutlinedInput-root": {
                                        backgroundColor: "var(--input-bg)",
                                        color: "var(--input-text)",
                                        "& fieldset": {
                                            borderColor: "var(--input-border)",
                                        },
                                        "&:hover fieldset": {
                                            borderColor: "var(--Green-2)",
                                        },
                                        "&.Mui-focused fieldset": {
                                            borderColor: "var(--Green-1) !important",
                                        },
                                        "& .MuiInputAdornment-root .MuiIconButton-root": {
                                            color: "var(--input-text)",
                                        },
                                    },
                                    "& .MuiInputLabel-root": {
                                        color: "var(--input-text)",
                                    },
                                },
                            },
                            openPickerIcon: {
                                sx: {
                                    color: "var(--input-text)",
                                },
                            },
                        }}
                    />
                </div>
            </FilterSection>
        </div>
    )
}