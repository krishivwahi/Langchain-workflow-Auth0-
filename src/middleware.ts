import { monoCloud } from './lib/monocloud';

export default monoCloud.authMiddleware();

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
