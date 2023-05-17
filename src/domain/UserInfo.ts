import { iots } from '@code-expert/prelude';
import { createSignedAPIRequest } from '@/domain/createAPIRequest';

export const UserInfoC = iots.strict({
  userName: iots.string,
});
export type UserInfo = iots.TypeOf<typeof UserInfoC>;

export const getUserInfo = () =>
  createSignedAPIRequest({
    path: 'user/info',
    payload: {},
    method: 'GET',
    codec: UserInfoC,
  });
