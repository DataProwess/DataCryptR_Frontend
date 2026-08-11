import React, { createContext, useContext, useEffect, useState } from "react";
import authService from "../auth";
import { API_URL } from "../ApiConfig";

const S3AccountContext = createContext();

export const S3AccountProvider = ({ children }) => {
  const [s3AccountsData, setS3AccountsData] = useState([]);
  const [loadingS3Accounts, setLoadingS3Accounts] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoadingS3Accounts(true);
      try {
        const data = await authService.fetchS3AccountsData(API_URL);
        console.log("Fetched S3 Data successfully:", data);

        if (isMounted) {
          // Fallback to empty array if data is null/undefined
          setS3AccountsData(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Error fetching S3 accounts:", error);
      } finally {
        if (isMounted) {
          setLoadingS3Accounts(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false; // Prevent memory leak / state update on unmounted component
    };
  }, []);

  return (
    <S3AccountContext.Provider
      value={{
        s3AccountsData,
        loadingS3Accounts,
        setS3AccountsData,
      }}
    >
      {children}
    </S3AccountContext.Provider>
  );
};

export const useS3Account = () => {
  const context = useContext(S3AccountContext);
  if (!context) {
    throw new Error("useS3Account must be used within an S3AccountProvider");
  }
  return context;
};