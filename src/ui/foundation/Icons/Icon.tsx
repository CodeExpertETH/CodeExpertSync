/* eslint-disable no-restricted-imports */
import React from 'react';
import { array, pipe, record, string } from '../../../prelude';
import type { IconDefinition, IconName as FaIconName } from '@fortawesome/fontawesome-common-types';
import '@fortawesome/fontawesome-svg-core/styles.css';
import { FontAwesomeSvgIcon, FontAwesomeSvgIconProps } from 'react-fontawesome-svg-icon';

import { faEllipsisV } from '@fortawesome/free-solid-svg-icons/faEllipsisV';
import { faPen } from '@fortawesome/free-solid-svg-icons/faPen';
import { faSave } from '@fortawesome/free-solid-svg-icons/faSave';
import { faSave as faSaveRegular } from '@fortawesome/free-regular-svg-icons/faSave';
import { faUndo } from '@fortawesome/free-solid-svg-icons/faUndo';
import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faFileExport } from '@fortawesome/free-solid-svg-icons/faFileExport';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons/faInfoCircle';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { faPaperPlane as faPaperPlaneRegular } from '@fortawesome/free-regular-svg-icons/faPaperPlane';
import { faSection } from '@fortawesome/free-solid-svg-icons/faSection';
import { faShieldHalved } from '@fortawesome/free-solid-svg-icons/faShieldHalved';
import { faTable } from '@fortawesome/free-solid-svg-icons/faTable';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { faCaretLeft } from '@fortawesome/free-solid-svg-icons/faCaretLeft';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons/faCaretRight';
import { faLightbulb } from '@fortawesome/free-solid-svg-icons/faLightbulb';
import { faFrown } from '@fortawesome/free-regular-svg-icons/faFrown';
import { faMeh } from '@fortawesome/free-regular-svg-icons/faMeh';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons/faQuestionCircle';
import { faSmile } from '@fortawesome/free-regular-svg-icons/faSmile';
import { faClock as faClockRegular } from '@fortawesome/free-regular-svg-icons/faClock';
import { faClock as faClockSolid } from '@fortawesome/free-solid-svg-icons/faClock';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons/faClipboardCheck';
import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff';
import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn';
import { faUserFriends } from '@fortawesome/free-solid-svg-icons/faUserFriends';
import { faUserShield } from '@fortawesome/free-solid-svg-icons/faUserShield';
import { faCopy } from '@fortawesome/free-regular-svg-icons/faCopy';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons/faExclamationTriangle';
import { faEllipsisH } from '@fortawesome/free-solid-svg-icons/faEllipsisH';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons/faCircleCheck';
import { faUniversity } from '@fortawesome/free-solid-svg-icons/faUniversity';
import { faSchool } from '@fortawesome/free-solid-svg-icons/faSchool';
import { faHotel } from '@fortawesome/free-solid-svg-icons/faHotel';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faSlideshare } from '@fortawesome/free-brands-svg-icons/faSlideshare';
import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { faDesktop } from '@fortawesome/free-solid-svg-icons/faDesktop';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt';
import { faEnvelope as faEnvelopeRegular } from '@fortawesome/free-regular-svg-icons/faEnvelope';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons/faEnvelope';
import { faSearch } from '@fortawesome/free-solid-svg-icons/faSearch';
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons/faTimesCircle';
import { faWindowRestore } from '@fortawesome/free-regular-svg-icons/faWindowRestore';
import { faMinusSquare } from '@fortawesome/free-solid-svg-icons/faMinusSquare';
import { faEye } from '@fortawesome/free-solid-svg-icons/faEye';
import { faEdit } from '@fortawesome/free-solid-svg-icons/faEdit';
import { faBell } from '@fortawesome/free-solid-svg-icons/faBell';
import { faBellSlash } from '@fortawesome/free-solid-svg-icons/faBellSlash';
import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
import { faInbox } from '@fortawesome/free-solid-svg-icons/faInbox';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faSnowman } from '@fortawesome/free-solid-svg-icons/faSnowman';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faBook } from '@fortawesome/free-solid-svg-icons/faBook';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons/faBullhorn';
import { faCodeBranch } from '@fortawesome/free-solid-svg-icons/faCodeBranch';
import { faTachometerAlt } from '@fortawesome/free-solid-svg-icons/faTachometerAlt';
import { faCogs } from '@fortawesome/free-solid-svg-icons/faCogs';
import { faTractor } from '@fortawesome/free-solid-svg-icons/faTractor';
import { faDocker } from '@fortawesome/free-brands-svg-icons/faDocker';
import { faHdd } from '@fortawesome/free-regular-svg-icons/faHdd';
import { faArchive } from '@fortawesome/free-solid-svg-icons/faArchive';
import { faCloudDownloadAlt } from '@fortawesome/free-solid-svg-icons/faCloudDownloadAlt';
import { faLock } from '@fortawesome/free-solid-svg-icons/faLock';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import { faMicrochip } from '@fortawesome/free-solid-svg-icons/faMicrochip';
import { faVectorSquare } from '@fortawesome/free-solid-svg-icons/faVectorSquare';
import { faSync } from '@fortawesome/free-solid-svg-icons/faSync';
import { faStop } from '@fortawesome/free-solid-svg-icons/faStop';
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock';
import { faUserClock } from '@fortawesome/free-solid-svg-icons/faUserClock';
import { faCaretSquareUp } from '@fortawesome/free-solid-svg-icons/faCaretSquareUp';
import { faTrash } from '@fortawesome/free-solid-svg-icons/faTrash';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faFlask } from '@fortawesome/free-solid-svg-icons/faFlask';
import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey';
import { faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';
import { faEyeSlash } from '@fortawesome/free-solid-svg-icons/faEyeSlash';
import { faThumbtack } from '@fortawesome/free-solid-svg-icons/faThumbtack';
import { faUserGraduate } from '@fortawesome/free-solid-svg-icons/faUserGraduate';
import { faTasks } from '@fortawesome/free-solid-svg-icons/faTasks';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faVideo } from '@fortawesome/free-solid-svg-icons/faVideo';
import { faBookReader } from '@fortawesome/free-solid-svg-icons/faBookReader';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons/faChevronLeft';
import { faSpa } from '@fortawesome/free-solid-svg-icons/faSpa';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons/faChevronRight';
import { faEnvelopeOpen } from '@fortawesome/free-regular-svg-icons/faEnvelopeOpen';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons/faCheckSquare';
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons/faCalendarCheck';
import { faSortNumericDown } from '@fortawesome/free-solid-svg-icons/faSortNumericDown';
import { faSortNumericUpAlt } from '@fortawesome/free-solid-svg-icons/faSortNumericUpAlt';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';
import { faDotCircle } from '@fortawesome/free-solid-svg-icons/faDotCircle';
import { faCircle } from '@fortawesome/free-solid-svg-icons/faCircle';
import { faLink } from '@fortawesome/free-solid-svg-icons/faLink';
import { faComments } from '@fortawesome/free-regular-svg-icons/faComments';
import { faPrint } from '@fortawesome/free-solid-svg-icons/faPrint';
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { faRunning } from '@fortawesome/free-solid-svg-icons/faRunning';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck';
import { faHtml5 } from '@fortawesome/free-brands-svg-icons/faHtml5';
import { faFolderOpen as faFolderOpenRegular } from '@fortawesome/free-regular-svg-icons/faFolderOpen';
import { faFolder } from '@fortawesome/free-solid-svg-icons/faFolder';
import { faFolder as faFolderRegular } from '@fortawesome/free-regular-svg-icons/faFolder';
import { faUnlock } from '@fortawesome/free-solid-svg-icons/faUnlock';
import { faFileSignature } from '@fortawesome/free-solid-svg-icons/faFileSignature';
import { faChalkboardTeacher } from '@fortawesome/free-solid-svg-icons/faChalkboardTeacher';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons/faLockOpen';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faHighlighter } from '@fortawesome/free-solid-svg-icons/faHighlighter';
import { faUpload } from '@fortawesome/free-solid-svg-icons/faUpload';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon';
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun';
import { faImage } from '@fortawesome/free-regular-svg-icons/faImage';
import { faAlignJustify } from '@fortawesome/free-solid-svg-icons/faAlignJustify';
import { faColumns } from '@fortawesome/free-solid-svg-icons/faColumns';
import { faFileDownload } from '@fortawesome/free-solid-svg-icons/faFileDownload';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faCog } from '@fortawesome/free-solid-svg-icons/faCog';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons/faFileAlt';
import { faFile } from '@fortawesome/free-regular-svg-icons/faFile';
import { faForward } from '@fortawesome/free-solid-svg-icons/faForward';
import { faCalendar } from '@fortawesome/free-regular-svg-icons/faCalendar';
import { faUserGear } from '@fortawesome/free-solid-svg-icons/faUserGear';
import { faShieldAlt } from '@fortawesome/free-solid-svg-icons/faShieldAlt';
import { faBug } from '@fortawesome/free-solid-svg-icons/faBug';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import { faEraser } from '@fortawesome/free-solid-svg-icons/faEraser';
import { faMars } from '@fortawesome/free-solid-svg-icons/faMars';
import { faVenus } from '@fortawesome/free-solid-svg-icons/faVenus';
import { faMarsAndVenus } from '@fortawesome/free-solid-svg-icons/faMarsAndVenus';
import { faGenderless } from '@fortawesome/free-solid-svg-icons/faGenderless';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons/faPuzzlePiece';
import { faDatabase } from '@fortawesome/free-solid-svg-icons/faDatabase';
import { faBoxes } from '@fortawesome/free-solid-svg-icons/faBoxes';
import { faPercent } from '@fortawesome/free-solid-svg-icons/faPercent';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons/faChevronDown';
import { faUnlink } from '@fortawesome/free-solid-svg-icons/faUnlink';
import { faShare } from '@fortawesome/free-solid-svg-icons/faShare';
import { faFileImport } from '@fortawesome/free-solid-svg-icons/faFileImport';
import { faPencilRuler } from '@fortawesome/free-solid-svg-icons/faPencilRuler';
import { faBookOpen } from '@fortawesome/free-solid-svg-icons/faBookOpen';
import { faSort } from '@fortawesome/free-solid-svg-icons/faSort';
import { faNoteSticky } from '@fortawesome/free-regular-svg-icons/faNoteSticky';
import { faNoteSticky as faNoteStickySolid } from '@fortawesome/free-solid-svg-icons/faNoteSticky';
import { faUsersGear } from '@fortawesome/free-solid-svg-icons/faUsersGear';
import { faTrashArrowUp } from '@fortawesome/free-solid-svg-icons/faTrashArrowUp';
import { faAngleDown } from '@fortawesome/free-solid-svg-icons/faAngleDown';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';

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
