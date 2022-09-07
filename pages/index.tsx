import { ApplicationStageType } from '@prisma/client';
import { Auth, GithubAuthProvider, signInWithRedirect, signOut, User } from 'firebase/auth';
import type { NextPage } from 'next';
import Head from 'next/head';
import { useContext, useEffect, useState } from 'react';
import AuthContext from '../context/AuthContext';
import styles from '../styles/Home.module.css';
import { isApplicationStageType } from '../utils/types';

const Home: NextPage = () => {
  const { auth, currentUser } = useContext(AuthContext);
  const [jwtToken, setJwtToken] = useState<string>();

  useEffect(() => {
    currentUser?.getIdToken().then(setJwtToken);
  }, [currentUser, setJwtToken]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className="text-3xl italic text-rose-500 bg-amber-300 rounded-md p-2">
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <div className="space-y-4">
          {displayUserInfo(currentUser)}
          {displayLogOutOptions(auth)}
        </div>
        <div className="space-y-4 p-8">
          <div className="break-all">{jwtToken || 'JWT token not found'}</div>
          <p>
            Check out the JWT token at{' '}
            <a className="text-sky-500" href="https://jwt.io">
              jwt.io
            </a>
          </p>
          <p>{foo('APPLIED')}</p>
          <p>{foo('ONLINE_ASSESSMENT')}</p>
          <p>{foo('TECHNICAL')}</p>
          <p>{foo('NON_TECHNICAL')}</p>
          <p>{foo('MIXED')}</p>
          <p>{foo('OFFERED')}</p>
          <p>{foo('ACCEPTED')}</p>
          <p>{foo('REJECTED')}</p>
          <p>{foo('WITHDRAWN')}</p>
          <p>{foo(null)}</p>
          <p>{foo(undefined)}</p>
          <p>{foo({})}</p>
          <p>{foo({ APPLIED: true })}</p>
          <p>{foo(['APPLIED'])}</p>
        </div>
      </main>
    </div>
  );
};

const foo = (x: any) => `${x} : ${isApplicationStageType(x)}`;
function testCustomGuard(x: any) {
  if (!isApplicationStageType(x)) return;
  let y: ApplicationStageType;
  y = x; // Compiler does not complain!
}

function displayUserInfo(user: User | undefined) {
  if (!user) return <>Failed to get user!</>;

  const githubProviderData = user.providerData.length != 0 ? user.providerData[0] : null;
  return (
    <>
      <p>Logged in as UID {user?.uid}</p>
      {githubProviderData?.photoURL ? (
        <div className="flex space-x-4">
          <p>Github Provider Data:</p>
          <img src={githubProviderData.photoURL} alt="Github Profile Photo" width="30"></img>
          <p>{githubProviderData.email}</p>
        </div>
      ) : (
        <p>Not signed in to github</p>
      )}
    </>
  );
}

function displayLogOutOptions(auth: Auth | undefined) {
  return (
    <div className="flex space-x-4">
      <button
        className="rounded-full bg-indigo-500 p-2 text-white"
        onClick={() => {
          if (!auth) {
            alert('Auth not found.');
            return;
          }

          signOut(auth);
        }}
      >
        <p>Log Out</p>
      </button>
      <button
        className="rounded-full bg-indigo-500 p-2 text-white"
        onClick={() => {
          if (!auth) {
            alert('Auth not found.');
            return;
          }

          const provider = new GithubAuthProvider();
          provider.setCustomParameters({
            allow_signup: 'false',
          });

          signInWithRedirect(auth, provider);
        }}
      >
        Log in with Github
      </button>
    </div>
  );
}

export default Home;
