import { GithubOutlined, LogoutOutlined } from '@ant-design/icons';
import { Button, MenuProps } from 'antd';
import { GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { useContext, useState, ReactNode, Key } from 'react';
import logo from '../../assets/logoPlaceholder.png';
import AuthContext from '../../context/AuthContext';
import { StatusMessageType } from '../../types/apiResponse';
import { removePreviousUserToken, storePreviousUserToken } from '../../utils/localStorage/temporaryUserKeyStorage';
import { openNotification } from '../notification/Notifier';

type MenuItem = Required<MenuProps>['items'][number];

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

  function getItem(label: ReactNode, key: Key, icon?: ReactNode, children?: MenuItem[], type?: 'group'): MenuItem {
    return {
      key,
      icon,
      children,
      label,
      type,
    } as MenuItem;
  }

  const items: MenuProps['items'] = [getItem('Log out', '1', <LogoutOutlined />)];

  return (
    <div className="w-full fixed top-0 p-2 flex justify-between items-center z-50">
      <img src={logo.src} width="175px" />

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
          {/*<Button*/}
          {/*  type="primary"*/}
          {/*  icon={<LogoutOutlined />}*/}
          {/*  className="items-center flex bg-blue-400 text-black rounded-md hover:bg-blue-500 hover:text-black focus:text-black border-none hover:border-none"*/}
          {/*  onClick={handleLogout}*/}
          {/*>*/}
          {/*  Log out*/}
          {/*</Button>*/}

          {githubProviderData?.photoURL && (
            <img
              src={githubProviderData?.photoURL}
              width="35px"
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
      {/*{shouldShowProfileMenu && <Menu items={items} className="absolute right-2 top-10 shadow-md" />}*/}
    </div>
  );
}

export default Header;
