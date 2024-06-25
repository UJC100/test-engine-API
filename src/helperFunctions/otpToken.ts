export class BaseHelper{
    static generateToken():number {
        return Math.floor(Math.random() * 900000) + 100000
    }
}