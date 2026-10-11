import * as React from "react"
import type { ComponentType } from "react"

// Temporary setup guard. Remove the form override only after its native email
// destination is configured in Framer's Send To controls. No external receiver.
export function withSubmissionLock(Component: ComponentType<any>): ComponentType {
    return React.forwardRef<any, any>((props, ref) => <Component {...props} ref={ref}
        onSubmitCapture={(event: React.FormEvent<HTMLFormElement>) => {
            event.preventDefault()
            event.stopPropagation()
        }} />)
}

/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function SubmissionUnavailable({ style = {} }: { style?: React.CSSProperties }) {
    return <button disabled type="button" style={{ ...style, width: "100%", height: "100%", minHeight: 52, border: 0, borderRadius: 8, background: "#0C3E2E", color: "#F4F2EC", opacity: .65, fontFamily: "Alumni Sans, sans-serif", fontWeight: 700, fontSize: 22 }}>Submissions opening soon</button>
}
