import * as React from "react"
import type { ComponentType } from "react"

// Keep this override attached until a signed HTTPS webhook is deployed and tested.
export function withSubmissionLock(Component): ComponentType {
    return (props) => <Component {...props} onSubmit={(event) => event.preventDefault()} onSubmitCapture={(event) => { event.preventDefault(); event.stopPropagation() }} onClickCapture={(event) => { if ((event.target as HTMLElement)?.closest('button[type="submit"]')) { event.preventDefault(); event.stopPropagation() } }} />
}
/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function SubmissionUnavailable({ style }) {
    return <button disabled type="button" style={{ ...style, width: "100%", height: "100%", border: 0, borderRadius: 8, background: "#0C3E2E", color: "#F4F2EC", opacity: .65, fontFamily: "Alumni Sans, sans-serif", fontWeight: 700, fontSize: 22 }}>Submissions opening soon</button>
}
