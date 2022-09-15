import { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import { GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useContext } from 'react';
import logo from '../../assets/placeholder.png';
import profilePlaceholder from '../../assets/profilePlaceholder.png';
import AuthContext from '../../context/AuthContext';
import { StatusMessageType } from '../../types/apiResponse';
import { openNotification } from '../notification/Notifier';

function Header() {
  const { auth, currentUser } = useContext(AuthContext);
  const githubProviderData = currentUser?.providerData.length != 0 ? currentUser?.providerData[0] : null;

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

    signInWithPopup(auth, provider).then((userCredentials) =>
      openNotification({ type: StatusMessageType.SUCCESS, message: `Welcome, ${userCredentials.user.displayName}!` }),
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

    signOut(auth).then(() =>
      openNotification({
        type: StatusMessageType.SUCCESS,
        message: `See you again soon, ${currentUser?.displayName}!`,
      }),
    );
  };

  return (
    <div className="pl-5 pr-5 md:pl-20 md:pr-20 pt-3 pb-3 flex justify-between items-center sticky top-0 bg-slate-100">
      <img src={logo.src} width="175px" />

      {currentUser?.isAnonymous && (
        <Button
          type="primary"
          icon={<GithubOutlined />}
          className="items-center flex bg-blue-400 text-black rounded-md hover:bg-blue-500 hover:text-black focus:text-black"
          onClick={handleLogin}
        >
          Log in with Github
        </Button>
      )}

      {!currentUser?.isAnonymous && (
        <div className="flex items-center space-x-4">
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            className="items-center flex bg-blue-400 text-black rounded-md hover:bg-blue-500 hover:text-black focus:text-black"
            onClick={handleLogout}
          >
            Log out
          </Button>

          <img src={githubProviderData?.photoURL || profilePlaceholder.src} width="35px" className="rounded-full" />
        </div>
      )}
    </div>
  );
}

export default Header;
