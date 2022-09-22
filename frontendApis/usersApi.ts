import axios from 'axios';
import { ApiPromise } from '../types/apiResponse';
import { UserData } from '../types/user';
import { processRequest } from './api';

const USER_API_ENDPOINT = '/api/user';

// This does not go through the interceptor as it is called in the authentication flow and the JWT token may not exist
// in the interceptor yet.
class UsersApi {
  // Idempotent create account function. Successfully returns with no change if user exists.
  public createAccount(newToken: string, oldToken?: string, isVerified = false): ApiPromise<UserData> {
    const apiResult = axios.post(
      USER_API_ENDPOINT,
      { oldToken, isVerified },
      { headers: { Authorization: `Bearer ${newToken}` } },
    );
    return processRequest(USER_API_ENDPOINT, apiResult);
  }
}

const usersApi = new UsersApi();

export default usersApi;
