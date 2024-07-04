# Folksity

A mobile reporting service that rewards users

## Usage (development)
- Run the python server in `PythonServer/app.py`.
- Next, run `pnpm dev` if `pnpm` is installed, or `npx next dev` if you want to use `npx` instead.
- The system for rewards payout has a bug where it will say something along the lines of `"pk value is invalid"`. This only affects the reward payout (`swap`) system.
- The admin, reports, profile, user, and the rest of the rewards system(s) all work perfectly fine.
- If you get an error relating to `typing_extensions`, run `pip install --upgrade typing_extensions` or just disable the reward payout (`swap`) system.
- Thank you for taking the time to read me! Goodbye!
  
## To be an admin (development)

- Login with the username as `admin` and password as `admin`
- If the username `admin` does not exist, just register it with any password.
- By default with the existing database, the username and password are already both `admin` on an account.

## Regular user

- Sign up with any username and password.

Please use the website on mobile to use the app.

Desktop version (landing page)
![image](https://github.com/DoneWithWork/make-it-challenge/assets/72771758/3c0cacce-06db-4f9d-b638-f3670398b41a)
