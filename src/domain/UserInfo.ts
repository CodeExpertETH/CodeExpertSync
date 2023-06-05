import { iots } from '@code-expert/prelude';

export const UserInfoC = iots.strict({
  userName: iots.string,
});
export type UserInfo = iots.TypeOf<typeof UserInfoC>;
