/* eslint-disable no-restricted-imports */
import { array, pipe, record, string } from '@code-expert/prelude';
import type { IconName as FaIconName, IconDefinition } from '@fortawesome/fontawesome-common-types';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { faDocker } from '@fortawesome/free-brands-svg-icons/faDocker';
import { faHtml5 } from '@fortawesome/free-brands-svg-icons/faHtml5';
import { faSlideshare } from '@fortawesome/free-brands-svg-icons/faSlideshare';
import { faCalendar } from '@fortawesome/free-regular-svg-icons/faCalendar';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons/faCalendarCheck';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons/faClock';
import { faComments } from '@fortawesome/free-regular-svg-icons/faComments';
import { faCopy } from '@fortawesome/free-regular-svg-icons/faCopy';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons/faEnvelope';
import { faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons/faEnvelopeOpen';
import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faFolder as faFolderRegular } from '@fortawesome/free-regular-svg-icons/faFolder';
import { faFolderOpen as faFolderOpenRegular } from '@fortawesome/free-regular-svg-icons/faFolderOpen';
import { faFrown } from '@fortawesome/free-regular-svg-icons/faFrown';
import { faHdd } from '@fortawesome/free-regular-svg-icons/faHdd';
import { faImage } from '@fortawesome/free-regular-svg-icons/faImage';
import { faMeh } from '@fortawesome/free-regular-svg-icons/faMeh';
import { faNoteSticky } from '@fortawesome/free-regular-svg-icons/faNoteSticky';
import { faPaperPlane as faPaperPlaneRegular } from '@fortawesome/free-regular-svg-icons/faPaperPlane';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import { faSave as faSaveRegular } from '@fortawesome/free-regular-svg-icons/faSave';
import { faSmile } from '@fortawesome/free-regular-svg-icons/faSmile';
import { faWindowRestore } from '@fortawesome/free-regular-svg-icons/faWindowRestore';
import { faAlignJustify } from '@fortawesome/free-solid-svg-icons/faAlignJustify';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';
import { faArchive } from '@fortawesome/free-solid-svg-icons/faArchive';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { faBellSlash } from '@fortawesome/free-solid-svg-icons/faBellSlash';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faBookReader } from '@fortawesome/free-solid-svg-icons/faBookReader';
import { faBoxes } from '@fortawesome/free-solid-svg-icons/faBoxes';
import { faBug } from '@fortawesome/free-solid-svg-icons/faBug';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons/faBullhorn';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { faCaretSquareUp } from '@fortawesome/free-solid-svg-icons/faCaretSquareUp';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons/faCheckSquare';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons/faCircleCheck';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { faClock as faClockSolid } from '@fortawesome/free-solid-svg-icons/faClock';
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt';
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faColumns } from '@fortawesome/free-solid-svg-icons/faColumns';
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import { faDesktop } from '@fortawesome/free-solid-svg-icons/faDesktop';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons/faDotCircle';
import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons/faFileDownload';
import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport';
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport';
import { faFileSignature } from '@fortawesome/free-solid-svg-icons/faFileSignature';
import { faFlask } from '@fortawesome/free-solid-svg-icons/faFlask';
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder';
import { faForward } from '@fortawesome/free-solid-svg-icons/faForward';
import { faGenderless } from '@fortawesome/free-solid-svg-icons/faGenderless';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import { faHighlighter } from '@fortawesome/free-solid-svg-icons/faHighlighter';
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faHotel } from '@fortawesome/free-solid-svg-icons/faHotel';
import { faInbox } from '@fortawesome/free-solid-svg-icons/faInbox';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons/faLightbulb';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons/faLockOpen';
import { faMars } from '@fortawesome/free-solid-svg-icons/faMars';
import { faMarsAndVenus } from '@fortawesome/free-solid-svg-icons/faMarsAndVenus';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons/faMicrochip';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons/faMinusSquare';
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon';
import { faNoteSticky as faNoteStickySolid } from '@fortawesome/free-solid-svg-icons/faNoteSticky';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faPencilRuler } from '@fortawesome/free-solid-svg-icons/faPencilRuler';
import { faPercent } from '@fortawesome/free-solid-svg-icons/faPercent';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons/faPuzzlePiece';
import { faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';
import { faRunning } from '@fortawesome/free-solid-svg-icons/faRunning';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faSchool } from '@fortawesome/free-solid-svg-icons/faSchool';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faSection } from '@fortawesome/free-solid-svg-icons/faSection';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons/faShieldAlt';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faSnowman } from '@fortawesome/free-solid-svg-icons/faSnowman';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faSortNumericDown } from '@fortawesome/free-solid-svg-icons/faSortNumericDown';
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons/faSortNumericUpAlt';
import { faSpa } from '@fortawesome/free-solid-svg-icons/faSpa';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { faTable } from '@fortawesome/free-solid-svg-icons/faTable';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks';
import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff';
import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn';
import { faTractor } from '@fortawesome/free-solid-svg-icons/faTractor';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faTrashArrowUp } from '@fortawesome/free-solid-svg-icons/faTrashArrowUp';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { faUniversity } from '@fortawesome/free-solid-svg-icons/faUniversity';
import { faUnlink } from '@fortawesome/free-solid-svg-icons/faUnlink';
import { faUnlock } from '@fortawesome/free-solid-svg-icons/faUnlock';
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck';
import { faUserClock } from '@fortawesome/free-solid-svg-icons/faUserClock';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons/faUserFriends';
import { faUserGear } from '@fortawesome/free-solid-svg-icons/faUserGear';
import { faUserGraduate } from '@fortawesome/free-solid-svg-icons/faUserGraduate';
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret';
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faUsersGear } from '@fortawesome/free-solid-svg-icons/faUsersGear';
import { faVectorSquare } from '@fortawesome/free-solid-svg-icons/faVectorSquare';
import { faVenus } from '@fortawesome/free-solid-svg-icons/faVenus';
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import React from 'react';
import { FontAwesomeSvgIcon, FontAwesomeSvgIconProps } from 'react-fontawesome-svg-icon';

const icons_ = {
  'align-justify': faAlignJustify,
  'angle-down': faAngleDown,
  'angle-right': faAngleRight,
  'bell-slash': faBellSlash,
  'book-open': faBookOpen,
  'book-reader': faBookReader,
  'calendar-check': faCalendarCheck,
  'caret-down': faCaretDown,
  'caret-left': faCaretLeft,
  'caret-right': faCaretRight,
  'caret-square-up': faCaretSquareUp,
  'caret-up': faCaretUp,
  'chalkboard-teacher': faChalkboardTeacher,
  'chart-bar': faChartBar,
  'check-square': faCheckSquare,
  'chevron-down': faChevronDown,
  'chevron-left': faChevronLeft,
  'chevron-right': faChevronRight,
  'circle-check': faCircleCheck,
  'clipboard-check': faClipboardCheck,
  'cloud-download-alt': faCloudDownloadAlt,
  'code-branch': faCodeBranch,
  'dot-circle': faDotCircle,
  edit: faEdit,
  'ellipsis-h': faEllipsisH,
  'ellipsis-v': faEllipsisV,
  'envelope-open': faEnvelopeOpen,
  'envelope-regular': faEnvelopeRegular,
  'envelope-solid': faEnvelope,
  'exclamation-triangle': faExclamationTriangle,
  'external-link-alt': faExternalLinkAlt,
  'eye-slash': faEyeSlash,
  eye: faEye,
  'file-alt': faFileAlt,
  'file-download': faFileDownload,
  'file-export': faFileExport,
  'file-import': faFileImport,
  'file-signature': faFileSignature,
  'folder-open-regular': faFolderOpenRegular,
  'folder-regular': faFolderRegular,
  'folder-solid': faFolder,
  'graduation-cap': faGraduationCap,
  'info-circle': faInfoCircle,
  'lock-open': faLockOpen,
  'mars-and-venus': faMarsAndVenus,
  'minus-square': faMinusSquare,
  'note-sticky': faNoteSticky,
  'note-sticky-solid': faNoteStickySolid,
  'paper-plane-regular': faPaperPlaneRegular,
  'paper-plane-solid': faPaperPlane,
  'pencil-ruler': faPencilRuler,
  'puzzle-piece': faPuzzlePiece,
  'question-circle': faQuestionCircle,
  'save-regular': faSaveRegular,
  'save-solid': faSave,
  'shield-alt': faShieldAlt,
  'shield-halved': faShieldHalved,
  'sign-in-alt': faSignInAlt,
  'sign-out-alt': faSignOutAlt,
  'sort-numeric-down': faSortNumericDown,
  'sort-numeric-up-alt': faSortNumericUpAlt,
  'tachometer-alt': faTachometerAlt,
  'times-circle': faTimesCircle,
  'toggle-off': faToggleOff,
  'toggle-on': faToggleOn,
  'trash-arrow-up': faTrashArrowUp,
  'user-check': faUserCheck,
  'user-clock': faUserClock,
  'user-friends': faUserFriends,
  'user-gear': faUserGear,
  'user-graduate': faUserGraduate,
  'user-lock': faUserLock,
  'user-secret': faUserSecret,
  'user-shield': faUserShield,
  user: faUser,
  'users-gear': faUsersGear,
  'vector-square': faVectorSquare,
  'window-restore': faWindowRestore,
  archive: faArchive,
  ban: faBan,
  bars: faBars,
  bell: faBell,
  book: faBook,
  boxes: faBoxes,
  bug: faBug,
  bullhorn: faBullhorn,
  calendar: faCalendar,
  check: faCheck,
  circle: faCircle,
  'clock-regular': faClockRegular,
  'clock-solid': faClockSolid,
  code: faCode,
  cog: faCog,
  cogs: faCogs,
  columns: faColumns,
  comment: faComment,
  comments: faComments,
  copy: faCopy,
  database: faDatabase,
  desktop: faDesktop,
  docker: faDocker,
  eraser: faEraser,
  file: faFile,
  flask: faFlask,
  forward: faForward,
  frown: faFrown,
  genderless: faGenderless,
  hdd: faHdd,
  heartbeat: faHeartbeat,
  highlighter: faHighlighter,
  history: faHistory,
  home: faHome,
  hotel: faHotel,
  html5: faHtml5,
  image: faImage,
  inbox: faInbox,
  key: faKey,
  lightbulb: faLightbulb,
  link: faLink,
  list: faList,
  lock: faLock,
  mars: faMars,
  meh: faMeh,
  microchip: faMicrochip,
  minus: faMinus,
  moon: faMoon,
  pen: faPen,
  percent: faPercent,
  play: faPlay,
  plus: faPlus,
  print: faPrint,
  redo: faRedo,
  running: faRunning,
  school: faSchool,
  search: faSearch,
  section: faSection,
  share: faShare,
  slideshare: faSlideshare,
  smile: faSmile,
  snowman: faSnowman,
  sort: faSort,
  spa: faSpa,
  spinner: faSpinner,
  stop: faStop,
  sun: faSun,
  sync: faSync,
  table: faTable,
  tasks: faTasks,
  terminal: faTerminal,
  thumbtack: faThumbtack,
  times: faTimes,
  tractor: faTractor,
  trash: faTrash,
  undo: faUndo,
  university: faUniversity,
  unlink: faUnlink,
  unlock: faUnlock,
  upload: faUpload,
  users: faUsers,
  venus: faVenus,
  video: faVideo,
  xmark: faXmark,
};

export type IconName = keyof typeof icons_;
export const iconNames = pipe(icons_, record.keys, array.sort(string.Ord));

type FaIconNameExtended = FaIconName | `${FaIconName}-solid` | `${FaIconName}-regular`;
const icons: Record<Extract<FaIconNameExtended, IconName>, IconDefinition> = icons_;

export interface IconProps extends Omit<FontAwesomeSvgIconProps, 'icon' | 'mask' | 'fixedWidth'> {
  name: IconName;
  mask?: IconName;
  /**
   * Variable width icons should be used in situations where the icon is an integral part of a text
   * and should be part of the flow, not outside of it.
   *
   * @example "A click on the (i) icon, ..."
   */
  variableWidth?: boolean;
}

const Icon = React.forwardRef<SVGSVGElement, IconProps>(function Icon_(
  { name, mask, variableWidth = false, ...props },
  ref,
) {
  return (
    <FontAwesomeSvgIcon
      ref={ref}
      fixedWidth={!variableWidth}
      icon={icons[name]}
      data-icon={name}
      aria-hidden={true}
      focusable={false}
      role={'img'}
      {...props}
    />
  );
});

export default Icon;
