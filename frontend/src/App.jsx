import React, { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { AnimatePresence, MotionConfig } from "framer-motion";
import { AppContext } from "./context";
import { api, readLocal, saveLocal } from "./api";
import SEO from "./components/SEO";
import ScrollToHash from "./hooks/ScrollToHash";
import { Header, Footer, MobileNav } from "./components/Layout";
import Planner from "./components/Planner";
import Home from "./pages/Home";
import { Services, ServiceDetail, NotFound } from "./pages/Services";
import { Locations, StateDetail } from "./pages/Locations";
import Account from "./pages/Account";
import Projects from "./pages/Projects";
import Contact from "./pages/Contact";
import { GreetingRow } from "./context/LocationContext";
import "./App.css";
export default function App() {
  const [user, setUser] = useState(null),
    [projects, setProjects] = useState(readLocal),
    [planner, setPlanner] = useState(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [authReady, setAuthReady] = useState(false);
  async function refresh() {
    setLoading(true);
    try {
      setProjects(user ? await api("/projects") : readLocal());
      setError("");
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    api("/auth/me")
      .then((r) => setUser(r.user))
      .catch(() => {})
      .finally(() => setAuthReady(true));
  }, []);
  useEffect(() => {
    setProjects([]);
    refresh();
  }, [user]);
  const addProject = async (p) => {
    if (!authReady)
      throw new Error(
        "Please wait while we check your account, then try saving again.",
      );
    if (user) await api("/projects", "POST", p);
    else if (!readLocal().some((v) => v.clientId === p.clientId))
      saveLocal([
        {
          ...p,
          status: "Planned",
          notes: "",
          quotes: [],
          createdAt: new Date().toISOString(),
          history: [
            { action: "Project planned", at: new Date().toISOString() },
          ],
        },
        ...readLocal(),
      ]);
    await refresh();
  };
  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        projects,
        refresh,
        error,
        loading,
        authReady,
        planner,
        setPlanner,
        addProject,
      }}
    >
      <MotionConfig reducedMotion="user">
        <SEO />
        <ScrollToHash />
        <div id="site-shell">
          <a className="skip-link" href="#content">
            Skip to content
          </a>
          <Header />
          <GreetingRow />
          <div id="content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:slug" element={<ServiceDetail />} />
              <Route path="/locations" element={<Locations />} />
              <Route path="/locations/:slug" element={<StateDetail />} />
              <Route path="/account" element={<Account />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
          <Footer />
          <MobileNav />
        </div>
        <AnimatePresence>
          {planner && <Planner key={planner.service.id} planner={planner} />}
        </AnimatePresence>
      </MotionConfig>
    </AppContext.Provider>
  );
}
