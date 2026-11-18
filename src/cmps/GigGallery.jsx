import { Buttons } from "@testing-library/user-event/dist/cjs/system/pointer/buttons.js"
import { useState } from "react"

export default function GigGallery() {
    const [currentImage, setCurrentImage] = useState('')
    return(
        <div>
            <img src={currentImage} alt="" />
            <div>
                <Button></Button>
                <Button></Button>
            </div>
        </div>
    )
}