import { ApiPromise } from '../types/apiResponse';
import { UserData, UserPostData } from '../types/user';
import api from './api';

export const USER_API_ENDPOINT = 'user';

class UsersApi {
  public linkAccount(userPostData: UserPostData): ApiPromise<UserData> {
    return api.post(USER_API_ENDPOINT, userPostData).then((res) => res.data);
  }
}

const usersApi = new UsersApi();

export default usersApi;
