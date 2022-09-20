import axios from 'axios';
import { ApiPromise, ApiResponse } from '../types/apiResponse';
import { UserData, UserPostData } from '../types/user';
import api from './api';

const USER_API_ENDPOINT = '/api/user';

// This does not go through the interceptor as it is called in the authentication flow and the JWT token may not exist
// in the interceptor yet.
class UsersApi {
  // Idempotent create account function. Successfully returns with no change if user exists.
  public createAccount(newUserToken: string): ApiPromise<UserData> {
    return axios.post(USER_API_ENDPOINT, {
      headers: { Authorization: `Bearer ${newUserToken}` },
    });
  }
}

const usersApi = new UsersApi();

export default usersApi;
