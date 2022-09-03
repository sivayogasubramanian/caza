import { Auth, GithubAuthProvider, signInWithRedirect, signOut, User } from 'firebase/auth';
import type { NextPage } from 'next';
import Head from 'next/head';
import AuthContext from '../context/AuthContext';
import styles from '../styles/Home.module.css';

const Home: NextPage = () => {
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
          <AuthContext.Consumer>{({ currentUser }) => displayUserInfo(currentUser)}</AuthContext.Consumer>
          <AuthContext.Consumer>{({ auth }) => displayLogOutOptions(auth)}</AuthContext.Consumer>
        </div>
      </main>
    </div>
  );
};

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
