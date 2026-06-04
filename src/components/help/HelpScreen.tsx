"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Network, User, Plug, Shield, Bot } from "lucide-react"
import AboutTab from "./tabs/AboutTab"
import ArchitectureTab from "./tabs/ArchitectureTab"
import JourneyTab from "./tabs/JourneyTab"
import IntegrationsTab from "./tabs/IntegrationsTab"
import PrivacyTab from "./tabs/PrivacyTab"
import AIAgentsTab from "./tabs/AIAgentsTab"

export default function HelpScreen() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sora text-3xl text-white">Help Center</h1>
        <p className="text-slate-400 mt-1">Architecture, user journeys, integrations, and AI agent documentation.</p>
      </div>
      <Tabs defaultValue="about" className="w-full">
        <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 h-auto flex flex-wrap gap-1 w-full justify-start">
          <TabsTrigger value="about" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><Info size={14} />About</TabsTrigger>
          <TabsTrigger value="architecture" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><Network size={14} />Architecture</TabsTrigger>
          <TabsTrigger value="journey" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><User size={14} />User Journey</TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><Plug size={14} />Integrations</TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><Shield size={14} />Privacy</TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-1.5 text-slate-400 hover:text-slate-200 data-active:bg-emerald-500/20 data-active:!text-emerald-400"><Bot size={14} />AI Agents</TabsTrigger>
        </TabsList>
        <TabsContent value="about" className="mt-6"><AboutTab /></TabsContent>
        <TabsContent value="architecture" className="mt-6"><ArchitectureTab /></TabsContent>
        <TabsContent value="journey" className="mt-6"><JourneyTab /></TabsContent>
        <TabsContent value="integrations" className="mt-6"><IntegrationsTab /></TabsContent>
        <TabsContent value="privacy" className="mt-6"><PrivacyTab /></TabsContent>
        <TabsContent value="ai-agents" className="mt-6"><AIAgentsTab /></TabsContent>
      </Tabs>
    </div>
  )
}
