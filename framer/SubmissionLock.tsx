import * as React from "react"
import type { ComponentType } from "react"

const receiver = "https://cancha-automation.onrender.com"

// Keep this export name so existing opportunity/provider/offer form bindings survive.
export function withSubmissionLock(Component: ComponentType<any>): ComponentType {
    return React.forwardRef<any, any>((props, ref) => {
        const busy = React.useRef(false)
        const delivery = React.useRef<{ body: string; token: string } | null>(null)
        const [message, setMessage] = React.useState("")
        const [failed, setFailed] = React.useState(false)
        const submit = async (event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            event.stopPropagation()
            const form = event.currentTarget as HTMLFormElement
            if (busy.current || !form.reportValidity()) return
            busy.current = true
            form.dispatchEvent(new CustomEvent("cancha-intake-state", { detail: { busy: true } }))
            setMessage("Sending…")
            setFailed(false)
            try {
                const values = Object.fromEntries(new FormData(form).entries())
                const checkbox = form.querySelector<HTMLInputElement>('input[name="Permission"][type="checkbox"]')
                values.Permission = checkbox?.checked ? "true" : values.Permission
                const kind = values["Provider Name"] ? "provider" : values.Company ? "offer" : "opportunity"
                const body = JSON.stringify(values)
                if (!delivery.current || delivery.current.body !== body) {
                    const response = await fetch(receiver + "/intake/challenge", { credentials: "omit", signal: AbortSignal.timeout(20000) })
                    if (!response.ok) throw new Error("unavailable")
                    const challenge = await response.json()
                    if (typeof challenge.token !== "string") throw new Error("unavailable")
                    delivery.current = { body, token: challenge.token }
                }
                const response = await fetch(receiver + "/intake/" + kind, {
                    method: "POST", credentials: "omit", signal: AbortSignal.timeout(20000),
                    headers: { "Content-Type": "application/json", "X-Cancha-Intake-Token": delivery.current.token }, body,
                })
                const result = await response.json()
                if (!response.ok || result.status !== "Pending review" || typeof result.id !== "string") {
                    if (response.status === 401) delivery.current = null
                    throw new Error("not-saved")
                }
                form.reset()
                delivery.current = null
                setMessage("Received—pending review. Your contact details stay private. Nothing is published automatically.")
            } catch {
                setFailed(true)
                setMessage("We couldn’t confirm your submission. Your details are still here; please try again. If a previous send was saved, retrying the same details won’t create another copy.")
            } finally {
                busy.current = false
                form.dispatchEvent(new CustomEvent("cancha-intake-state", { detail: { busy: false } }))
            }
        }
        return <><Component {...props} ref={ref} onSubmitCapture={submit} onSubmit={(event: React.FormEvent<HTMLFormElement>) => event.preventDefault()} />
            {message && <p role={failed ? "alert" : "status"} aria-live="polite" style={{ margin: "8px 0", color: failed ? "#8F2D16" : "#0C3E2E", fontFamily: "Alumni Sans, sans-serif", fontSize: 20 }}>{message}</p>}</>
    })
}

/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function SubmissionUnavailable({ style = {} }: { style?: React.CSSProperties }) {
    const button = React.useRef<HTMLButtonElement>(null)
    const [ready, setReady] = React.useState(false)
    const [busy, setBusy] = React.useState(false)
    React.useEffect(() => {
        let mounted = true
        const check = async () => {
            try {
                const response = await fetch(receiver + "/health", { credentials: "omit", signal: AbortSignal.timeout(15000) })
                const data = await response.json()
                if (mounted) setReady(response.ok && data.publicIntake === 1 && data.privateStorage === true)
            } catch { if (mounted) setReady(false) }
        }
        check()
        const timer = setInterval(check, 30000)
        const form = button.current?.closest("form")
        const state = (event: Event) => setBusy(!!(event as CustomEvent).detail?.busy)
        form?.addEventListener("cancha-intake-state", state)
        return () => { mounted = false; clearInterval(timer); form?.removeEventListener("cancha-intake-state", state) }
    }, [])
    return <button ref={button} disabled={!ready || busy} type="submit" style={{ ...style, width: "100%", height: "100%", minHeight: 52, border: 0, borderRadius: 8, background: "#0C3E2E", color: "#F4F2EC", opacity: ready && !busy ? 1 : .65, fontFamily: "Alumni Sans, sans-serif", fontWeight: 700, fontSize: 22, cursor: ready && !busy ? "pointer" : "default" }}>{busy ? "Sending…" : ready ? "Send for review" : "Submissions temporarily unavailable"}</button>
}
