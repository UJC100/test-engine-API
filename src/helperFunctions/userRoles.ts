import { TemporaryUserTable, UserSignup } from "src/entities/signUp.details";
import { Role } from "src/enum/role";
import { Repository } from "typeorm";



export const UserRoles = async (
  tempUserRepo: Repository<TemporaryUserTable>,
  role: string,
  secretKey: string,
  hashedPassword: string,
  email: string,
  username: string,
) => {
  const tutorSecret = process.env.TUTOR_KEY;
  const adminSecret = process.env.ADMIN_KEY;
  if (role === 'admin' && secretKey === adminSecret) {
    const createAdmin = tempUserRepo.create({
      username,
      password: hashedPassword,
      email,
      role: Role.admin,
    });
    const saveAdmin = tempUserRepo.save(createAdmin);
    return saveAdmin;
  } else if (role === 'tutor' && secretKey === tutorSecret) {
    const createTutor = tempUserRepo.create({
      username,
      password: hashedPassword,
      email,
      role: Role.tutor,
    });
    const saveAdmin = tempUserRepo.save(createTutor);
    return saveAdmin;
  } else {
    const createStudent = tempUserRepo.create({
      username,
      password: hashedPassword,
      email,
    });
    const saveStudent = tempUserRepo.save(createStudent);
    return saveStudent;
  }
};