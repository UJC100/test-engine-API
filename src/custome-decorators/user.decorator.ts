import { ExecutionContext, createParamDecorator } from "@nestjs/common";

export const User = createParamDecorator((data, ctx: ExecutionContext) => {
  const req = ctx.switchToHttp().getRequest()
  // console.log(req)
  return data? req.user[data] : req.user
});
