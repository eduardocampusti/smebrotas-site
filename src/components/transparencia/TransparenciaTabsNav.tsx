import { useMemo } from 'react'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import type { TransparenciaTabConfig, TransparenciaTabId } from './types'

type TransparenciaTabsNavProps = {
  tabs: TransparenciaTabConfig[]
  value: TransparenciaTabId
  onValueChange: (value: TransparenciaTabId) => void
}

export function TransparenciaTabsNav({
  tabs,
  value,
  onValueChange,
}: TransparenciaTabsNavProps) {
  const currentLabel = useMemo(
    () => tabs.find((tab) => tab.id === value)?.label ?? 'Selecione',
    [tabs, value],
  )

  return (
    <div className="space-y-3">
      <div className="md:hidden">
        <Select value={value} onValueChange={(v) => onValueChange(v as TransparenciaTabId)}>
          <SelectTrigger className="h-10 w-full rounded-xl border-slate-200 bg-white">
            <SelectValue>{currentLabel}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {tabs.map((tab) => (
              <SelectItem key={tab.id} value={tab.id}>
                {tab.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="hidden md:block">
        <div className="overflow-x-auto pb-1">
          <TabsList
            variant="line"
            className="flex min-w-max gap-2 bg-transparent p-0"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'h-auto rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 transition duration-200 hover:bg-[#EFF6FF] hover:text-[#0B4F8A]',
                    'data-active:border-[#0B4F8A] data-active:bg-[#0B4F8A] data-active:text-white data-active:shadow-md',
                  )}
                >
                  <Icon className="size-4" />
                  <span>{tab.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>
        </div>
      </div>
    </div>
  )
}
