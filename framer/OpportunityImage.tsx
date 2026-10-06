import * as React from "react"
import { addPropertyControls, ControlType } from "framer"

/** @framerSupportedLayoutWidth any @framerSupportedLayoutHeight any */
export default function OpportunityImage(props) {
    const { image, treatment = "Badge", background = "Light", maxWidth = 240, organization = "Organization", style } = props
    const [failed, setFailed] = React.useState(false)
    const photo = treatment === "Photo"
    const src = typeof image === "string" ? image : image?.src
    React.useEffect(() => setFailed(false), [src])
    return <div style={{ ...style, width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box", padding: photo ? 0 : 24, overflow: "hidden", borderRadius: 8, background: background === "Dark" ? "#0C3E2E" : "#F4F2EC" }}>
        {src && !failed ? <img src={src} alt={organization} onError={() => setFailed(true)} style={{ display: "block", width: "100%", height: "100%", maxWidth: photo ? "100%" : Math.max(1, maxWidth), maxHeight: photo ? "100%" : 180, objectFit: photo ? "cover" : "contain", objectPosition: "center" }} /> : <span style={{ fontFamily: "Alumni Sans, sans-serif", fontSize: 20, color: background === "Dark" ? "#F4F2EC" : "#0C3E2E", textAlign: "center" }}>{organization}</span>}
    </div>
}
addPropertyControls(OpportunityImage, {
    image: { type: ControlType.ResponsiveImage, title: "Image" },
    treatment: { type: ControlType.String, title: "Treatment", defaultValue: "Badge" },
    background: { type: ControlType.String, title: "Background", defaultValue: "Light" },
    maxWidth: { type: ControlType.Number, title: "Badge Width", defaultValue: 240 },
    organization: { type: ControlType.String, title: "Organization" },
})
