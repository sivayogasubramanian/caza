import { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useState } from 'react';
import logo from '../../assets/logoPlaceholder.png';
import AuthContext from '../../context/AuthContext';
import { StatusMessageType } from '../../types/apiResponse';
import { removePreviousUserToken, storePreviousUserToken } from '../../utils/localStorage/temporaryUserKeyStorage';
import { openNotification } from '../notification/Notifier';

function Header() {
  const { auth, currentUser } = useContext(AuthContext);
  const githubProviderData = currentUser?.providerData.length != 0 ? currentUser?.providerData[0] : null;

  const [shouldShowProfileMenu, setShouldShowProfileMenu] = useState<boolean>(false);

  const handleLogin = () => {
    if (!auth) {
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

    const storeIfAnonymous = currentUser?.isAnonymous
      ? currentUser.getIdToken(true).then(storePreviousUserToken)
      : Promise.resolve();

    storeIfAnonymous.then(() =>
      signInWithPopup(auth, provider).finally(() =>
        openNotification({ type: StatusMessageType.SUCCESS, message: 'Logged in successfully!' }),
      ),
    );
  };

  const handleLogout = () => {
    if (!auth) {
      openNotification({
        type: StatusMessageType.ERROR,
        message: 'There was an error when trying to log out. Please try again.',
      });
      return;
    }

    removePreviousUserToken();

    signOut(auth).finally(() =>
      openNotification({ type: StatusMessageType.SUCCESS, message: 'Logged out successfully!' }),
    );
  };

  return (
    <div className="bg-primary-one w-full fixed top-0 p-2 mb-2 flex justify-between items-center z-50">
      <img src={logo.src} width="150px" />

      {currentUser?.isAnonymous && (
        <Button
          type="primary"
          icon={<GithubOutlined />}
          className="items-center flex bg-blue-400 text-black rounded-md hover:bg-blue-500 hover:text-black focus:text-black border-none hover:border-none"
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
              width="30px"
              className="rounded-full"
              onClick={() => setShouldShowProfileMenu(!shouldShowProfileMenu)}
            />
          )}

          {shouldShowProfileMenu && (
            <Button className="absolute right-2 top-10 shadow-md" icon={<LogoutOutlined />} onClick={handleLogout}>
              Log out
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

export default Header;
