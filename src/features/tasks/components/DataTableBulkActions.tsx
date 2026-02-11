'use client'

import { Trash2, Tag, Layers, Archive, X, FlagIcon, FlagOffIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTranslations } from "next-intl"
import { useUpdateTask } from "../api/use-update-task"
import { useDeleteTask } from "../api/use-delete-task"
import { useConfirm } from "@/hooks/use-confirm"
import { Task } from "../types"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select"
import { useCustomLabels } from "@/app/workspaces/hooks/use-custom-labels"
import { TASK_TYPE_OPTIONS } from "../constants/type"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "motion/react"
import { useState } from "react"

interface DataTableBulkActionsProps<TData> {
  selectedTasks: TData[]
  selectedCount: number
  onClearSelection: () => void
}

export function DataTableBulkActions<TData extends Record<string, unknown>>({
  selectedTasks,
  selectedCount,
  onClearSelection,
}: DataTableBulkActionsProps<TData>) {
  const t = useTranslations('workspaces')
  const { mutate: updateTask } = useUpdateTask()
  const { mutate: deleteTask } = useDeleteTask()
  const { customLabels } = useCustomLabels()
  const [isProcessing, setIsProcessing] = useState(false)
  const [DeleteDialog, confirmDelete] = useConfirm(
    t('delete-tasks'),
    t('delete-tasks-confirm', { count: selectedCount }),
    'destructive'
  )
  const [ArchiveDialog, confirmArchive] = useConfirm(
    t('archive-tasks-confirm', { count: selectedCount }),
    t('archive-tasks-confirm-message'),
    'default'
  )

  // Calcular si debemos destacar o quitar destacado (mostrar la opción más útil)
  const featuredCount = selectedTasks.filter((task) => (task as unknown as Task).featured).length
  const shouldFeature = featuredCount <= selectedCount / 2

  const handleBulkDelete = async () => {
    const ok = await confirmDelete()
    if (!ok) return

    setIsProcessing(true)
    let completed = 0

    // Delete each task individually
    selectedTasks.forEach((task) => {
      deleteTask({
        param: { taskId: (task as unknown as Task).$id }
      }, {
        onSettled: () => {
          completed++
          if (completed === selectedTasks.length) {
            setIsProcessing(false)
            onClearSelection()
          }
        }
      })
    })
  }

  const handleBulkFeature = () => {
    setIsProcessing(true)
    let completed = 0

    selectedTasks.forEach((task) => {
      updateTask({
        json: { featured: shouldFeature },
        param: { taskId: (task as unknown as Task).$id }
      }, {
        onSettled: () => {
          completed++
          if (completed === selectedTasks.length) {
            setIsProcessing(false)
            onClearSelection()
          }
        }
      })
    })
  }

  const handleBulkSetLabel = (labelId: string) => {
    setIsProcessing(true)
    let completed = 0

    selectedTasks.forEach((task) => {
      updateTask({
        json: { label: labelId },
        param: { taskId: (task as unknown as Task).$id }
      }, {
        onSettled: () => {
          completed++
          if (completed === selectedTasks.length) {
            setIsProcessing(false)
            onClearSelection()
          }
        }
      })
    })
  }

  const handleBulkSetType = (type: string) => {
    setIsProcessing(true)
    let completed = 0

    selectedTasks.forEach((task) => {
      updateTask({
        json: { type },
        param: { taskId: (task as unknown as Task).$id }
      }, {
        onSettled: () => {
          completed++
          if (completed === selectedTasks.length) {
            setIsProcessing(false)
            onClearSelection()
          }
        }
      })
    })
  }

  const handleBulkArchive = async () => {
    const ok = await confirmArchive()
    if (!ok) return

    setIsProcessing(true)
    const archivedAt = new Date()
    let completed = 0

    selectedTasks.forEach((task) => {
      updateTask({
        json: {
          archived: true,
          archivedAt
        },
        param: { taskId: (task as unknown as Task).$id }
      }, {
        onSettled: () => {
          completed++
          if (completed === selectedTasks.length) {
            setIsProcessing(false)
            onClearSelection()
          }
        }
      })
    })
  }

  return (
    <>
      <DeleteDialog />
      <ArchiveDialog />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="mb-3 overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-3 py-2 bg-muted/50 rounded-md border">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                {t('selected-count', { count: selectedCount })}
              </span>
              <div className="h-4 w-px bg-border" />

              {/* Feature / Unfeature */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkFeature}
                disabled={isProcessing}
                className="h-8"
              >
                {shouldFeature ? (
                  <>
                    <FlagIcon className="size-4 mr-1" />
                    {t('bulk-feature')}
                  </>
                ) : (
                  <>
                    <FlagOffIcon className="size-4 mr-1" />
                    {t('bulk-unfeature')}
                  </>
                )}
              </Button>

              {/* Set Label */}
              <Select onValueChange={handleBulkSetLabel} disabled={isProcessing}>
                <SelectTrigger className="h-8 w-fit gap-2 border-0 shadow-none hover:bg-accent">
                  <Tag className="size-4" />
                  <span>{t('bulk-set-label')}</span>
                </SelectTrigger>
                <SelectContent>
                  {customLabels.map((label) => {
                    return (
                      <SelectItem key={label.id} value={label.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="size-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                          <span>{label.name}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Set Type */}
              <Select onValueChange={handleBulkSetType} disabled={isProcessing}>
                <SelectTrigger className="h-8 w-fit gap-2 border-0 shadow-none hover:bg-accent">
                  <Layers className="size-4" />
                  <span>{t('bulk-set-type')}</span>
                </SelectTrigger>
                <SelectContent>
                  {TASK_TYPE_OPTIONS.map((type) => {
                    const Icon = type.icon
                    return (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn("size-4", type.textColor)} />
                          <span>{t(type.translationKey)}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>

              {/* Archive */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkArchive}
                disabled={isProcessing}
                className="h-8"
              >
                <Archive className="size-4 mr-1" />
                {t('bulk-archive')}
              </Button>

              {/* Delete */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isProcessing}
                className="h-8 text-destructive hover:text-destructive"
              >
                <Trash2 className="size-4 mr-1" />
                {t('bulk-delete')}
              </Button>
            </div>

            {/* Clear Selection */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              className="h-8"
            >
              <X className="size-4 mr-1" />
              {t('clear-selection')}
            </Button>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  )
}
