class Single {
    static instance;
    constructor(options){
        this.id = options.id
    }
    static getInstanceof = function(options){
        if(!this.instance){
            this.instance = new Single(options)
        }
        return this.instance
    }
}
export default Single