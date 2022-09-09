/**
 * Body of the POST request to '/api/user/linkAccount'.
 *
 * The 'old_token' field indicates the JWT token of the old account that needs to be replaced by the new account.
 * The details of the new (current) account will be provided by the Authorization header (Bearer type) in the request
 * as per normal.
 */
export interface AccountPostData {
  old_token?: string;
}
