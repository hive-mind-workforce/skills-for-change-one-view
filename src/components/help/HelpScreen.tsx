"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Network, User, Plug, Shield, Bot, ArrowRightLeft, Users } from "lucide-react"
import AboutTab from "./tabs/AboutTab"
import ArchitectureTab from "./tabs/ArchitectureTab"
import JourneyTab from "./tabs/JourneyTab"
import IntegrationsTab from "./tabs/IntegrationsTab"
import PrivacyTab from "./tabs/PrivacyTab"
import AIAgentsTab from "./tabs/AIAgentsTab"
import MigrationTab from "./tabs/MigrationTab"
import ChangeManagementTab from "./tabs/ChangeManagementTab"

export default function HelpScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-3xl text-slate-900 dark:text-white">About OneView</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Architecture, user journeys, integrations, migration plan, and AI agent documentation.</p>
      </div>
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-white/[0.04] border border-slate-200 dark:border-white/[0.08] p-1 h-auto flex flex-nowrap overflow-x-auto gap-1 w-full justify-start scrollbar-none">
          <TabsTrigger value="about" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Info size={14} />About</TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Network size={14} />Architecture</TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><User size={14} />User Journey</TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Plug size={14} />Integrations</TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Shield size={14} />Privacy</TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Bot size={14} />AI Agents</TabsTrigger>
          <TabsTrigger value="migration" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><ArrowRightLeft size={14} />Migration Plan</TabsTrigger>
          <TabsTrigger value="change" className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-600 dark:data-active:!text-emerald-400"><Users size={14} />Change Mgmt</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-6"><AboutTab /></TabsContent>
        <TabsContent value="architecture" className="mt-6"><ArchitectureTab /></TabsContent>
        <TabsContent value="journey" className="mt-6"><JourneyTab /></TabsContent>
        <TabsContent value="integrations" className="mt-6"><IntegrationsTab /></TabsContent>
        <TabsContent value="privacy" className="mt-6"><PrivacyTab /></TabsContent>
        <TabsContent value="ai-agents" className="mt-6"><AIAgentsTab /></TabsContent>
        <TabsContent value="migration" className="mt-6"><MigrationTab /></TabsContent>
        <TabsContent value="change" className="mt-6"><ChangeManagementTab /></TabsContent>
      </Tabs>
    </div>
  )
}
