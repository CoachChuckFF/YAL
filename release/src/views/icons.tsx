import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faKeySkeleton, 
    faTreasureChest, 
    faTrash, 
    faTimes, 
    faChevronSquareLeft,
    faChevronSquareRight,
    faPuzzlePiece,
    faBook,
    faUndo,
    faWallet,
    faPlay,
    faAngleUp,
    faAngleDown,
    faArrowRightFromBracket,
    faTerminal,
    faKeySkeletonLeftRight,
    faXmark,
    faTimer,
    faHeart,
} from '@fortawesome/pro-regular-svg-icons'

export function GuideIcon() {
    return <FontAwesomeIcon icon={faBook}/>
}

export function HeartIcon() {
  return <FontAwesomeIcon icon={faHeart}/>
}

export function PuzzleIcon() {
    return <FontAwesomeIcon icon={faPuzzlePiece} />
}

export function KeyIcon() {
    return <FontAwesomeIcon icon={faKeySkeleton} />
}

export function ChestIcon() {
  return <FontAwesomeIcon icon={faTreasureChest} />
}

export function RefreshIcon() {
    return <FontAwesomeIcon icon={faUndo}/>
}

export function WalletIcon() {
  return <FontAwesomeIcon icon={faWallet}/>
}

export function SpeedrunIcon() {
  return <FontAwesomeIcon icon={faTimer}/>
}

export function BreakIcon() {
  return <FontAwesomeIcon icon={faXmark}/>
}

export function ForgeIcon() {
  return <FontAwesomeIcon icon={faKeySkeletonLeftRight}/>
}

export function TerminalIcon() {
  return <FontAwesomeIcon icon={faTerminal}/>
}

export function LogoutIcon() {
  return <FontAwesomeIcon icon={faArrowRightFromBracket}/>
}

export function CancelIcon() {
  return <FontAwesomeIcon icon={faTimes}/>
}

export function TrashIcon() {
  return <FontAwesomeIcon icon={faTrash}/>
}

export function LeftIcon() {
  return <FontAwesomeIcon icon={faChevronSquareLeft}/>
}

export function RightIcon() {
  return <FontAwesomeIcon icon={faChevronSquareRight}/>
}

export function PlayIcon() {
  return <FontAwesomeIcon icon={faPlay}/>
}

export function UpIcon() {
  return <FontAwesomeIcon icon={faAngleUp}/>
}

export function DownIcon() {
  return <FontAwesomeIcon icon={faAngleDown}/>
}