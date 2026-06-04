"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import {
  BotIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  HistoryIcon,
  Loader2Icon,
  RefreshCcwIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/auth-context"
import { AiLog, apiClient } from "@/lib/api-client"
import { cn } from "@/lib/utils"

type Message = {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date | string
  source?: "vector" | "business" | "general" | "error"
}

type ConnectionState = "checking" | "connected" | "limited" | "error"

const promptSuggestions = [
  "Which products are low in stock right now?",
  "Summarize sales performance from the last 30 days.",
  "What should I reorder before the next demand spike?",
  "Suggest pricing actions for slow-moving inventory.",
]

const sourceLabels: Record<NonNullable<Message["source"]>, string> = {
  vector: "Vector context",
  business: "Business context",
  general: "General answer",
  error: "Service fallback",
}

function normalizeSource(source?: string): Message["source"] {
  if (source === "vector-search" || source === "vector") return "vector"
  if (source === "business-info" || source === "business") return "business"
  if (source === "error") return "error"
  return "general"
}

function formatTime(value: Date | string) {
  return new Intl.DateTimeFormat("en", {
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    day: "2-digit",
  }).format(new Date(value))
}

function trimText(value: string, limit = 96) {
  return value.length > limit ? `${value.slice(0, limit - 1)}...` : value
}

export default function AiAssistantPage() {
  const { user } = useAuth()
  const [messages, setMessages] = React.useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "I can answer with your Agriqon business context, inventory signals, recent orders, and synced product knowledge. Ask me what to restock, price, or investigate.",
      createdAt: "2026-06-05T00:00:00.000Z",
      source: "business",
    },
  ])
  const [input, setInput] = React.useState("")
  const [isSending, setIsSending] = React.useState(false)
  const [logs, setLogs] = React.useState<AiLog[]>([])
  const [logError, setLogError] = React.useState<string | null>(null)
  const [isLoadingLogs, setIsLoadingLogs] = React.useState(true)
  const [connectionState, setConnectionState] = React.useState<ConnectionState>("checking")
  const scrollRef = React.useRef<HTMLDivElement>(null)
  const messageIdRef = React.useRef(0)
  const hasAuthToken = React.useMemo(() => {
    if (typeof window === "undefined") return false
    return Boolean(localStorage.getItem("token") || localStorage.getItem("authToken"))
  }, [])

  const loadLogs = React.useCallback(async () => {
    setIsLoadingLogs(true)
    setLogError(null)

    try {
      const response = await apiClient.getAiLogs({ page: 1, limit: 8 })
      setLogs(response.data ?? [])
      setConnectionState("connected")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load AI logs"
      setLogs([])
      setLogError(message)
      setConnectionState(message.toLowerCase().includes("permission") ? "limited" : "error")
    } finally {
      setIsLoadingLogs(false)
    }
  }, [])

  React.useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadLogs()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadLogs])

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages, isSending])

  async function handleSend(promptOverride?: string) {
    const prompt = (promptOverride ?? input).trim()
    if (!prompt || isSending) return

    const nextMessageId = (prefix: string) => {
      messageIdRef.current += 1
      return `${prefix}-${messageIdRef.current}`
    }

    const userMessage: Message = {
      id: nextMessageId("user"),
      role: "user",
      content: prompt,
      createdAt: new Date(),
    }

    setMessages((current) => [...current, userMessage])
    setInput("")

    if (!hasAuthToken) {
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId("assistant-auth"),
          role: "assistant",
          content:
            "The backend AI API is ready, but this browser session does not have a JWT token. Please log in or set the API token so requests can be sent with `Authorization: Bearer ...` and bypass CSRF safely.",
          createdAt: new Date(),
          source: "error",
        },
      ])
      setConnectionState("error")
      return
    }

    setIsSending(true)

    try {
      const response = await apiClient.generateAiChat(prompt)
      const assistantMessage: Message = {
        id: nextMessageId("assistant"),
        role: "assistant",
        content: response.data?.content || "The AI service returned an empty answer.",
        createdAt: new Date(),
        source: normalizeSource(response.data?.source),
      }

      setMessages((current) => [...current, assistantMessage])
      setConnectionState("connected")
      void loadLogs()
    } catch (error) {
      const message = error instanceof Error ? error.message : "AI request failed"
      setMessages((current) => [
        ...current,
        {
          id: nextMessageId("assistant-error"),
          role: "assistant",
          content: `I could not reach the backend AI API. ${message}`,
          createdAt: new Date(),
          source: "error",
        },
      ])
      setConnectionState("error")
    } finally {
      setIsSending(false)
    }
  }

  const connectionCopy = {
    checking: {
      label: "Checking API",
      description: "Loading recent AI activity from the backend.",
      icon: Loader2Icon,
      badge: "outline" as const,
    },
    connected: {
      label: "Backend connected",
      description: "Chat and audit logs are connected to /api/v1/ai.",
      icon: CheckCircle2Icon,
      badge: "default" as const,
    },
    limited: {
      label: "Chat available",
      description: "Logs need admin or manager permission.",
      icon: ShieldCheckIcon,
      badge: "secondary" as const,
    },
    error: {
      label: "Needs login token",
      description: "AI endpoints require an authenticated backend session.",
      icon: TriangleAlertIcon,
      badge: "destructive" as const,
    },
  }[connectionState]

  const ConnectionIcon = connectionCopy.icon

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="grid gap-4 lg:grid-cols-[1fr_22rem]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SparklesIcon />
              AI Business Copilot
            </CardTitle>
            <CardDescription>
              Ask inventory, order, pricing, and market questions against your Agriqon business data.
            </CardDescription>
            <CardAction>
              <Badge variant={connectionCopy.badge}>
                <ConnectionIcon data-icon="inline-start" className={cn(connectionState === "checking" && "animate-spin")} />
                {connectionCopy.label}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <DatabaseIcon />
                  Context
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Business, stock, orders, and product embeddings.</p>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheckIcon />
                  Scoped
                </div>
                <p className="mt-2 text-sm text-muted-foreground">Requests use the authenticated user businessId.</p>
              </div>
              <div className="rounded-md border bg-muted/40 p-3">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <HistoryIcon />
                  Audited
                </div>
                <p className="mt-2 text-sm text-muted-foreground">AI prompts and responses are logged by the backend.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>API Connection</CardTitle>
            <CardDescription>{connectionCopy.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">Current user</span>
              <span className="text-sm font-medium">{user?.name || "Local demo"}</span>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">JWT token</span>
              <Badge variant={hasAuthToken ? "default" : "destructive"}>
                {hasAuthToken ? "Detected" : "Missing"}
              </Badge>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm text-muted-foreground">Base route</span>
              <Badge variant="outline">/api/v1/ai</Badge>
            </div>
            <Button variant="outline" onClick={() => void loadLogs()} disabled={isLoadingLogs}>
              {isLoadingLogs ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <RefreshCcwIcon data-icon="inline-start" />}
              Refresh logs
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="chat" className="min-h-0 flex-1">
        <TabsList>
          <TabsTrigger value="chat">
            <BotIcon data-icon="inline-start" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="logs">
            <HistoryIcon data-icon="inline-start" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="min-h-0">
          <Card className="h-[calc(100vh-20rem)] min-h-[34rem]">
            <CardHeader>
              <CardTitle>Ask the Copilot</CardTitle>
              <CardDescription>Answers are generated through the backend AI service with provider fallback.</CardDescription>
            </CardHeader>
            <CardContent className="flex min-h-0 flex-1 flex-col gap-4">
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto rounded-md border bg-muted/20 p-4">
                <div className="flex flex-col gap-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex",
                        message.role === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div
                        className={cn(
                          "max-w-[86%] rounded-md border p-3 shadow-xs",
                          message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card"
                        )}
                      >
                        <div className="mb-2 flex items-center gap-2">
                          <Badge variant={message.role === "user" ? "secondary" : "outline"}>
                            {message.role === "user" ? "You" : "Agriqon AI"}
                          </Badge>
                          {message.source ? <Badge variant="ghost">{sourceLabels[message.source]}</Badge> : null}
                          <span className="text-xs text-muted-foreground">{formatTime(message.createdAt)}</span>
                        </div>
                        <div
                          className={cn(
                            "prose prose-sm max-w-none dark:prose-invert",
                            message.role === "user" && "prose-invert"
                          )}
                        >
                          <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}

                  {isSending ? (
                    <div className="flex justify-start">
                      <div className="w-full max-w-md rounded-md border bg-card p-3">
                        <div className="mb-3 flex items-center gap-2 text-sm font-medium">
                          <Loader2Icon className="animate-spin" />
                          Generating business answer
                        </div>
                        <div className="flex flex-col gap-2">
                          <Skeleton className="h-3 w-4/5" />
                          <Skeleton className="h-3 w-3/5" />
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => void handleSend(suggestion)}
                    disabled={isSending}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>

              <form
                className="flex gap-2"
                onSubmit={(event) => {
                  event.preventDefault()
                  void handleSend()
                }}
              >
                <Input
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Ask about low stock, sales, pricing, procurement..."
                  disabled={isSending}
                />
                <Button type="submit" disabled={!input.trim() || isSending}>
                  {isSending ? <Loader2Icon data-icon="inline-start" className="animate-spin" /> : <SendIcon data-icon="inline-start" />}
                  Send
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Activity</CardTitle>
              <CardDescription>
                Pulled from the backend AI log API. Admin or manager permission may be required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingLogs ? (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : logError ? (
                <div className="rounded-md border p-4">
                  <div className="flex items-center gap-2 font-medium">
                    <TriangleAlertIcon />
                    Logs unavailable
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">{logError}</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="rounded-md border p-4">
                  <p className="text-sm font-medium">No AI logs yet</p>
                  <p className="mt-2 text-sm text-muted-foreground">Send a prompt to create the first audited interaction.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Time</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Prompt</TableHead>
                        <TableHead>Response</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {logs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="whitespace-nowrap text-muted-foreground">{formatTime(log.createdAt)}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.type}</Badge>
                          </TableCell>
                          <TableCell>{trimText(log.prompt)}</TableCell>
                          <TableCell className="text-muted-foreground">{trimText(log.response || "No response stored")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
