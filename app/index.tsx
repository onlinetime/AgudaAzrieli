import { Redirect } from "expo-router";

export default function Index() {
  return <Redirect href="./(app)/login" />;
  //return <Redirect href="./(app)/user/user-home" />;
  return <Redirect href="./(app)/admin/admin-home" />;
}
