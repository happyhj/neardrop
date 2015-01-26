function Neighbor(id, me){
	// me임을 확인하기 위한 flag
	this.me = me;

	this.id = id;	
	this.name = this.getUserName(id);
	this.image = this.getUserImageFileName(id);
	this.spring = null;
	this.el = null;
	// this.parent = null;
}

// 뿅 나타나게 스타일을 컨트롤 해주는 스프링 핸들러
Neighbor.prototype.springHandler = function(el, val){
	el.style.mozTransform =
	el.style.msTransform =
	el.style.webkitTransform =
	el.style.transform = 'scale3d(' + (1-val) + ', ' + (1-val) + ', 1)';
};

Neighbor.prototype.setDefaultSpring = function(){
	var that = this;
	var springSystem = new rebound.SpringSystem();
	var spring = springSystem.createSpring(50, 3);
	spring.addListener({
		onSpringUpdate: function(spring) {
			var val = spring.getCurrentValue();
			val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
			that.springHandler(that.el, val);
		}
	});	
	this.spring = spring;
}

Neighbor.prototype.setSpring = function(springHandler){
	var that = this;
	var springSystem = new rebound.SpringSystem();
	var spring = springSystem.createSpring(50, 3);
	spring.addListener({
		onSpringUpdate: function(spring) {
			var val = spring.getCurrentValue();
			val = rebound.MathUtil.mapValueInRange(val, 0, 1, 1, 0.5);
			springHandler(that.el, val);
		}
	});	
	this.spring = spring;
}

Neighbor.prototype.getIndexFromDigit = function(char){
	var asciiVal = char.charCodeAt(0);
	var index;
	if(asciiVal<=57) {
		// is Number!
		index = asciiVal - 48;
	} else {
		// is Char
		index = asciiVal - 87;
	}
	return index;
} 

Neighbor.prototype.getUserImageFileName = function(id) {
	return "user-"+(this.getIndexFromDigit(id.charAt(0))+1)+".png";
}
Neighbor.prototype.getUserName = function(id) {
	var gender = this.getIndexFromDigit(id.charAt(1))%2;
	gender = (gender===0)?"Boys":"Girls";
	var name = this.nameDictionary[gender][this.getIndexFromDigit(id.charAt(2))];
	return name;
}
 
Neighbor.prototype.nameDictionary = {
	"Boys":[
		"Noah"
		,"Liam"
		,"Jacob"
		,"Mason"
		,"Will"
		,"Ethan"
		,"Moon"
		,"Alex"
		,"Jay"
		,"Dan"
		,"Elijah"
		,"Aiden"
		,"James"
		,"Ben"
		,"Matt"
		,"Jack"
		,"Logan"
		,"Dave"
		,"Tony"
		,"Joe"
		,"Josh"
		,"Andy"
		,"Lucas"
		,"Brown"
		,"Sam"
		,"Chris"
		,"John"
		,"Isaac"
		,"Carter"
		,"Luke"
		,"Hunter"
		,"Henry"
		,"Rick"
		,"Oliver"
		,"Cooper"
		,"Eddie"
		],
	"Girls":[
		"Emma"
		,"Sophia"
		,"Olivia"
		,"Lisa"
		,"Ava"
		,"Mia"
		,"Emily"
		,"Aby"
		,"Maddie"
		,"Bella"
		,"Jill"
		,"Sally"
		,"Sofia"
		,"Chloe"
		,"Ella"
		,"Cony"
		,"Amelia"
		,"Nat"
		,"Grace"
		,"Hannah"
		,"Zoey"
		,"Vicky"
		,"Lilith"
		,"Lily"
		,"Brook"
		,"Sammie"
		,"Layla"
		,"Audrey"
		,"Anna"
		,"Dana"
		,"Aria" 
		,"Scarlett"
		,"Sadie"
		,"Penelope"
		,"Caroline"
		,"Nicole"
		]
};