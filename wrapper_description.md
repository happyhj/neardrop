<a 래퍼 구조 요약

[Peer]

// 멤버 변수들
Peer.id
  Peer가 공개적으로 보여줄 아이디.
  접속 가능한 주소여야 하므로 Listen하고 있는 공용 채널의 아이디를 사용한다.

Peer.(prototype.)config
  PlayRTC 객체를 생성하기 위한 설정 객체. 여러 번 사용되므로 this.에 등록해둔다.

Peer.playListen
  공용 채널에 연결된 PlayRTC 객체.
  채널을 만들고 나면 채널 아이디를 id에 등록하고
  접속이 감지되면 사설 채널을 만든다.

// 이벤트
Peer.emit("open", peerId) // peer id를 발급받았을 때. 여기에선 공용 채널이 생성되었을 때. 
Peer.emit("connection", dataConnection); // 다른 사람이 나에게 접속했을 때. 여기에선 사설 채널에 다른 사람이 들어왔을 때.

// 함수들
Peer.onConnection()
  공용 채널에서 addDataStream 이벤트가 발생했을 때 실행되는 함수
  playReceive 객체를 생성하여 새로운 사설 채널을 만들고
  새로 생성된 사설 채널의 아이디를 공용 채널을 통해 전달한다.
  사설 채널에 상대방이 접속했을 경우 Peer.on("connection") 이벤트를 발생시켜주는 것도 여기에서.

  // 공용 채널에 이미 둘 이상의 상대방이 접속해 있을 경우에 대한 대처가 필요

Peer.connect()
  공용 채널에 접속.
  접속시 사설 채널 아이디를 전달받으며, 
  // 에러를 피하기 위해
  전달받고, 현재의 연결을 안전하게 종료하고 나서야 사설 채널에 접속한다.
  // 이렇게 하지 않으면 addDataStream 이벤트가 가끔 안 불린다.

Peer._connect()
  사설 채널에 접속.
  데이터채널이 안정적으로 생성되면 connection.on("open") 이벤트가 발생한다.


[DataConnection]

// 멤버 변수들
DataConnection.peer
  이 연결의 상대방 아이디. 상대방의 공용 채널 아이디.

DataConnection.dataChannel
  사설 채널의 데이터채널

DataConnection.playConn
  ..

// 이벤트
DataConnection.emit("open");
  커넥션 객체가 만들어지고
  데이터채널과 플레이커넥션이 모두 등록된 때!

DataConnection.emit("data", data);
  데이터채널로부터 새로운 데이터가 입력되었을 때
  == dataChannel.on("message")

DataConnection.emit("close");
  사설 채널을 폭파시킬 때.
  // 누군가 연결이 끊어지거나 채널을 나갔을 때에도 실행되는 것이 옳은 방향일 듯.

// 함수들
DataConnection.setDataChannel()
DataConnection.setPlayConn()
  채널 생성이 DataConnection 객체의 반환 시점보다 느리기 때문에 사용. 이 두 함수가 다 실행되어야 open이라고 인식.
  // 물론 정확하게 그렇게 구현한 것은 아니고

DataConnection.send()
DataConnection.close()
  ..

  />