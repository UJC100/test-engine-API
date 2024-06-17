import { UserSignup } from "src/entities/signUp.details";
import { Role } from "src/enum/role";
import { Repository } from "typeorm";



export const UserRoles = async (
    userRepo: Repository<UserSignup>,
    role: string,
    secretKey: string,
    hashedPassword: string,
    email: string, 
    username: string
) => {
    const tutorSecret = process.env.TUTOR_KEY;
    const adminSecret = process.env.ADMIN_KEY;
    if (role === "admin" && secretKey === adminSecret) {
        const createAdmin = userRepo.create({
            username,
            password: hashedPassword,
            email,
            role: Role.admin
        })
        const saveAdmin = userRepo.save(createAdmin)
        return saveAdmin
    } else if (role === 'tutor' && secretKey === tutorSecret) {
        const createTutor = userRepo.create({
          username,
          password: hashedPassword,
          email,
          role: Role.tutor,
         });
        const saveAdmin = userRepo.save(createTutor);
        return saveAdmin
    }
    else {
         const createStudent = userRepo.create({
           username,
           password: hashedPassword,
           email,
         });
         const saveStudent = userRepo.save(createStudent);
         return saveStudent;
    }
}