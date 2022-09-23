import { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useState } from 'react';
import logo from '../../assets/logo.png';
import AuthContext from '../../context/AuthContext';
import usersApi from '../../frontendApis/usersApi';
import { ApiResponse, StatusMessageType } from '../../types/apiResponse';
import { UserData } from '../../types/user';
import { log, logException } from '../../utils/analytics';
import { openNotification } from '../notification/Notifier';
import { HOMEPAGE_ROUTE } from '../../utils/constants';
import { useRouter } from 'next/router';

const UNABLE_TO_AUTHENTICATE_MESSAGE = {
  type: StatusMessageType.ERROR,
  message: 'Sorry we were unable to authenticate you with Github. Please try again.',
};

function Header() {
  const router = useRouter();
  const { auth, currentUser } = useContext(AuthContext);
  const githubProviderData = currentUser?.providerData.length != 0 ? currentUser?.providerData[0] : null;

  const [shouldShowProfileMenu, setShouldShowProfileMenu] = useState<boolean>(false);

  const handleLogin = () => {
    log('click_login_button');

    if (!auth) {
      logException('`auth` object from AuthContext is falsy', false);
      openNotification({
        type: StatusMessageType.ERROR,
        message: 'There was an error when trying to log in. Please try again.',
      });
      return;
    }

    const provider = new GithubAuthProvider();
    provider.setCustomParameters({
      allow_signup: 'false',
    });

    const oldUserTokenIfAnonymous: Promise<string | undefined> = currentUser?.isAnonymous
      ? currentUser.getIdToken(true)
      : Promise.resolve(undefined);

    const newUserToken = signInWithPopup(auth, provider)
      .then(({ user: newUser }) => newUser.getIdToken())
      .catch(() => {
        throw { messages: [UNABLE_TO_AUTHENTICATE_MESSAGE] };
      });

    Promise.all([newUserToken, oldUserTokenIfAnonymous])
      .then(([newUserToken, oldUserToken]) => usersApi.createAccount(newUserToken, oldUserToken, true))
      .catch((result: ApiResponse<UserData>) => result.messages.forEach((message) => openNotification(message)));
  };

  const handleLogout = () => {
    log('click_logout_button');
    if (!auth) {
      logException('`auth` object from AuthContext is falsy', false);
      openNotification({
        type: StatusMessageType.ERROR,
        message: 'There was an error when trying to log out. Please try again.',
      });
      return;
    }

    signOut(auth)
      .then(() => setShouldShowProfileMenu(false))
      .finally(() => openNotification({ type: StatusMessageType.SUCCESS, message: 'Logged out successfully!' }));
  };

  return (
    <div className="bg-primary-three w-full fixed top-0 p-2 mb-2 flex justify-between items-center z-50">
      <img
        src={logo.src}
        alt="logo"
        height="30px"
        className="cursor-pointer"
        onClick={() => router.push(HOMEPAGE_ROUTE)}
      />

      {currentUser?.isAnonymous && (
        <Button
          type="primary"
          icon={<GithubOutlined />}
          className="items-center flex bg-secondary-one text-black rounded-md hover:bg-secondary-one hover:text-black focus:text-black border-none hover:border-none"
          onClick={handleLogin}
        >
          Log in with Github
        </Button>
      )}

      {!currentUser?.isAnonymous && (
        <div className="relative">
          {githubProviderData?.photoURL && (
            <img
              src={githubProviderData?.photoURL}
              height="30px"
              className="rounded-full cursor-pointer"
              onClick={() => setShouldShowProfileMenu(!shouldShowProfileMenu)}
            />
          )}

          {shouldShowProfileMenu && (
            <Button className="absolute right-0 top-10 shadow-md" icon={<LogoutOutlined />} onClick={handleLogout}>
              Log out
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
