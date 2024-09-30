import dayjs from "dayjs";
import { t } from "elysia";

const signupBodySchema = t.Object({
    name: t.String({ maxLength: 60, minLength: 1 }),
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 })
  });
  

  const loginBodySchema = t.Object({
    email: t.String({ format: "email" }),
    password: t.String({ minLength: 8 }),
  });
  
  function getExpTimestamp(seconds: number) {
    const currentTimeMillis = Date.now();
    const secondsIntoMillis = seconds * 1000;
    const expirationTimeMillis = currentTimeMillis + secondsIntoMillis;
  
    return Math.floor(expirationTimeMillis / 1000);
  }
  
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  export { loginBodySchema, signupBodySchema, getExpTimestamp, firstDayOfWeek, lastDayOfWeek };