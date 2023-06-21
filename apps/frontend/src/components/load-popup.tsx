import Popup from "./popup"
import Load from "./loading-spinner"

export default function LoadPopup(props: {Text: string}) {
    return <Popup onExit={() => { }}>
        <div class="h-full w-full">
            <div class="flex flex-col items-center justify-center h-full w-full">
                <Load />
                <h3>{ props.Text}</h3>
            </div>
        </div>
    </Popup>
}