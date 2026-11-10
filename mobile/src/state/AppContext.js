/* ==========================================================================
   AppContext.js - state shared by every screen
   ICT6400 Assessment 4 - CareerHub mobile

   Holds the data from the XML files, the saved and applied job ids, and the
   login session. As on the website, only ids are stored on the device, and
   the job itself is always read from the XML data.
   ========================================================================== */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchJobs, fetchResources } from '../data/api';

/* The same key names as the localStorage keys in the web app. */
const KEYS = {
  saved: 'careerhub.savedJobs',
  applied: 'careerhub.appliedJobs',
};

const LOADING = { status: 'loading', items: [], error: '' };

const AppContext = createContext(null);

async function readIds(key) {
  try {
    const raw = await AsyncStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return []; /* Damaged or unreadable storage must not stop the app. */
  }
}

export function AppProvider({ children }) {
  const [jobs, setJobs] = useState(LOADING);
  const [resources, setResources] = useState(LOADING);
  const [saved, setSaved] = useState([]);
  const [applied, setApplied] = useState([]);
  const [storageReady, setStorageReady] = useState(false);

  /* Like sessionStorage on the website, the session lasts until the app is
     closed. The password is never kept. */
  const [session, setSession] = useState(null);

  /* Each file loads on its own, so a problem with one does not break the other. */
  const load = useCallback(async (fetcher, setter) => {
    setter(LOADING);
    try {
      setter({ status: 'ready', items: await fetcher(), error: '' });
    } catch (error) {
      setter({ status: 'error', items: [], error: error.message });
    }
  }, []);

  const reloadJobs = useCallback(() => load(fetchJobs, setJobs), [load]);
  const reloadResources = useCallback(
    () => load(fetchResources, setResources),
    [load]
  );

  useEffect(() => {
    reloadJobs();
    reloadResources();
    Promise.all([readIds(KEYS.saved), readIds(KEYS.applied)]).then(
      ([storedSaved, storedApplied]) => {
        setSaved(storedSaved);
        setApplied(storedApplied);
        setStorageReady(true);
      }
    );
  }, [reloadJobs, reloadResources]);

  /* Nothing is written until the stored values have been read, otherwise the
     empty starting lists would overwrite them. */
  useEffect(() => {
    if (storageReady) {
      AsyncStorage.setItem(KEYS.saved, JSON.stringify(saved)).catch(() => {});
    }
  }, [saved, storageReady]);

  useEffect(() => {
    if (storageReady) {
      AsyncStorage.setItem(KEYS.applied, JSON.stringify(applied)).catch(() => {});
    }
  }, [applied, storageReady]);

  const toggleSaved = useCallback((id) => {
    setSaved((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    );
  }, []);

  const markApplied = useCallback((id) => {
    setApplied((current) => (current.includes(id) ? current : [...current, id]));
  }, []);

  const value = useMemo(
    () => ({
      jobs,
      resources,
      saved,
      applied,
      session,
      storageReady,
      reloadJobs,
      reloadResources,
      toggleSaved,
      markApplied,
      setSession,
    }),
    [jobs, resources, saved, applied, session, storageReady, reloadJobs,
      reloadResources, toggleSaved, markApplied]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  return useContext(AppContext);
}
