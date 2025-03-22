import { NgModule } from "@angular/core";
import { FaIconLibrary, FontAwesomeModule } from "@fortawesome/angular-fontawesome";

// Brands (fab)
import { faCreativeCommons, faCreativeCommonsBy, faCreativeCommonsNc, faCreativeCommonsNcEu, faCreativeCommonsNd, faCreativeCommonsSa, faFacebook, faTwitter, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

// Regular (far)
import { faBookmark as farBookmark, faCircle as farCircle, faClock as farClock, faComment as farComment, faCopyright as farCopyright, faFile as farFile, faFolder as farFolder, faStar as farStar, faUser as farUser } from "@fortawesome/free-regular-svg-icons";

// Solid (fas)
import {
  faAdjust, faAngleDown, faAngleUp, faArrowCircleUp, faArrowDown, faArrowLeft, faArrowPointer, faArrowRight, faArrowsLeftRight, faArrowsLeftRightToLine, faArrowsUpDown, faArrowTurnUp, faArrowUp, faAsterisk, faAtom, faBalanceScale, faBan, faBarcode, faBars, faBarsStaggered, faBell, faBookmark, faCalendar, faCalendarAlt, faCalendarXmark, faCamera, faCameraRetro, faChartBar, faChartLine, faChartSimple, faCheck, faCheckCircle, faChevronCircleLeft, faChevronCircleRight, faChevronDown, faChevronLeft, faChevronRight, faChevronUp, faCircle, faCircleCheck, faCircleChevronDown, faCircleChevronUp, faCircleDot, faCircleHalfStroke, faCircleMinus, faCircleNotch, faCirclePlus, faCircleXmark, faCloudUploadAlt, faClock, faCode, faCog, faComment, faCommentAlt, faCommentDollar, faComments, faComputerMouse, faCopy, faCopyright, faCrosshairs, faDatabase, faDollar, faDownLeftAndUpRightToCenter, faDroplet, faDumbbell, faEarthAfrica, faEarthAmericas, faEarthAsia, faEarthEurope, faEarthOceania, faEdit, faEllipsis, faEllipsisVertical, faEnvelope, faEquals, faEuroSign, faExclamationTriangle, faExpand, faExternalLinkAlt, faEye, faEyeDropper, faEyeSlash, faFile, faFileAlt, faFileCsv, faFileInvoice, faFilter, faFire, faFlag, faFlagUsa, faFolder, faFolderOpen, faFrown, faGavel, faGlobe, faGrip, faHammer, faHandPaper, faHandPointer, faHandshake, faHeart, faHome, faHourglass, faIcicles, faImage, faImages, faInbox, faInfo, faInfoCircle, faKey, faLanguage, faLaptop, faLayerGroup, faLink, faListAlt, faLocationArrow, faLock, faMagnifyingGlass, faMap, faMapMarkerAlt, faMicrochip, faMoneyBill, faMoon, faMousePointer, faPen, faPencil, faPersonWalkingArrowRight, faPlay, faPlus, faPlusCircle, faQuestion, faQuestionCircle, faRainbow, faReceipt, faRedo, faRepeat, faReply, faRotateLeft, faRuler, faSackDollar, faSave, faSearch, faShare, faShop, faShoppingCart, faSignOutAlt, faSliders, faSnowflake, faSort, faSortAlphaDown, faSortAlphaUp, faSortAmountDown, faSortDown, faSortNumericDown, faSortNumericUp, faSortUp, faSpinner, faSquare, faStar, faStarHalfStroke, faStore, faSun, faSync, faTableCells, faTableCellsLarge, faTachometerAlt, faTag, faTasks, faTemperatureHigh, faTerminal, faThermometer, faThumbsDown, faThumbsUp, faTimes, faTimesCircle, faTrash, faTrashAlt, faTrophy, faUndo, faUpload, faUser, faUserGroup, faUsers, faVideo
} from "@fortawesome/free-solid-svg-icons";

@NgModule({
  imports: [FontAwesomeModule],
  exports: [FontAwesomeModule]
})
export class IconsModule {
  constructor(library: FaIconLibrary) {
    // Add brands icons
    library.addIcons(
      faFacebook,
      faTwitter,
      faWhatsapp,
      faCreativeCommons,
      faCreativeCommonsBy,
      faCreativeCommonsSa,
      faCreativeCommonsNc,
      faCreativeCommonsNd,
      faCreativeCommonsNcEu
    );

    // Add regular icons
    library.addIcons(
      farStar,
      farCircle,
      farBookmark,
      farComment,
      farCopyright,
      farClock,
      farFile,
      farFolder,
      farUser
    );

    // Add solid icons
    library.addIcons(
      faAdjust, faAngleDown, faAngleUp, faArrowCircleUp, faArrowDown,
      faArrowLeft, faArrowPointer, faArrowRight, faArrowUp,
      faArrowsLeftRight, faArrowsLeftRightToLine, faArrowsUpDown, faAsterisk, faBan, faBarcode, faBars,
      faBarsStaggered, faBell, faBookmark, faCalendar, faCalendarAlt, faCalendarXmark,
      faCamera, faCameraRetro, faChartLine, faChartSimple, faCheck, faCheckCircle,
      faChevronCircleLeft, faChevronCircleRight,
      faChevronLeft, faChevronRight, faChevronUp, faChevronDown, faCircle, faCircleCheck,
      faCircleChevronDown, faCircleChevronUp, faCircleDot, faCircleHalfStroke,
      faCircleMinus, faCircleNotch, faCirclePlus, faCircleXmark, faCloudUploadAlt, faClock,
      faCode, faCog, faComment, faCommentAlt, faCommentDollar, faComments,
      faComputerMouse, faCopy, faCopyright, faCrosshairs, faDatabase,
      faDollar, faDownLeftAndUpRightToCenter, faDroplet, faEarthAfrica,
      faEarthAmericas, faEarthAsia, faEarthEurope, faEarthOceania, faEdit,
      faEllipsis, faEllipsisVertical, faEnvelope, faEquals, faEuroSign,
      faExclamationTriangle, faExpand, faEye, faEyeSlash, faFile,
      faFileAlt, faFileCsv, faFileInvoice, faFilter, faFlag, faFlagUsa, faFolder,
      faFolderOpen, faGavel, faGlobe, faGrip, faHammer, faHandshake,
      faHeart, faHome, faHourglass, faIcicles, faImage, faImages,
      faInbox, faInfo, faInfoCircle, faKey, faLaptop, faLayerGroup,
      faLink, faListAlt, faLock, faMap, faMapMarkerAlt, faMicrochip,
      faMoneyBill, faMoon, faPen, faPencil, faPlay, faPlus, faQuestion,
      faQuestionCircle, faReceipt, faRedo, faReply, faRotateLeft,
      faSackDollar, faSave, faSearch, faShare, faShop, faShoppingCart,
      faSignOutAlt, faSliders, faSnowflake, faSort, faSortAlphaDown,
      faSortAlphaUp, faSortAmountDown, faSortNumericDown, faSortNumericUp, faSortDown, faSortUp,
      faSpinner, faSquare, faStar, faStarHalfStroke, faStore, faSun,
      faSync, faTableCells, faTableCellsLarge, faTag, faTasks,
      faTemperatureHigh, faTerminal, faThumbsDown, faThumbsUp, faTimes,
      faTimesCircle, faTrash, faTrashAlt, faTrophy, faUndo, faUpload,
      faUser, faUserGroup, faUsers, faPersonWalkingArrowRight, faFrown,
      faHandPaper, faRuler, faEyeDropper, faFire, faThermometer, faAtom,
      faVideo, faRainbow, faPlusCircle, faBalanceScale, faDumbbell, faTachometerAlt,
      faMousePointer, faRepeat, faExternalLinkAlt, faArrowTurnUp, faHandPointer,
      faMagnifyingGlass, faLanguage, faChartBar, faLocationArrow
    );
  }
}
