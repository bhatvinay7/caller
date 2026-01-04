import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUser_details,userInfo } from "../lib/redux/featuresSlice/userDetails";
import type { RootState, AppDispatch } from "../lib/redux/store";
import type { userCredentials } from "types";

export default function useUserDetail(): userCredentials {
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector(userInfo);

  useEffect(() => {
      dispatch(getUser_details());
    
  }, [dispatch]);

  return user;
}
