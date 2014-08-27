Project_AirDropBox
==================

** 최신 크롬 브라우저만 지원합니다 **

파일전송 데모

- 사용방법: 두개의 브라우저창에 사이트를띄운 후 상단에 나의 peerID가 보이면 아래 칸에 열결대상의 peerID를 입력 후 파일을 선택하고 slicing process가 종료된 후에 send버튼을 누르면 파일전송이 시작된다.

Experiment 1. 흐름제어 없이 파일전송 DEMO

http://labs.heej.net/peerfile0/

- 파일전송은 되지만 송신, 수식측의 속도 비대칭이 발생
- 대용량 (400메가이상) 전송하면 수신측 죽음 

Experiment 2. 흐름제어 (Blob 하나씩만 전송) 파일전송 DEMO

http://labs.heej.net/peerfile1/

- 파일전송이 안정적으로 진행되고 수신자 송신자의 progress가 동기화 되어 진행
- 400MB 파일 전송 성공. 그 이상은 전송시 수신측 크래쉬 
