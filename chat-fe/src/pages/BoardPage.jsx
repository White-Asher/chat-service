import React, { useState, useEffect } from 'react';
import { getBoards, createBoard } from '../api'; // API 호출을 위한 함수 import

function BoardPage() {
    const [boards, setBoards] = useState([]);
    const [newBoard, setNewBoard] = useState({ title: '', content: '', author: 'testuser' });

    // 게시글 목록을 불러오는 함수
    const fetchBoards = async () => {
        try {
            const response = await getBoards();
            setBoards(response.data);
        } catch (error) {
            console.error('게시글 목록을 불러오는 중 오류 발생:', error);
        }
    };

    // 컴포넌트가 마운트될 때 게시글 목록을 불러옵니다.
    useEffect(() => {
        fetchBoards();
    }, []);

    // 입력 폼 변경 핸들러
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewBoard({ ...newBoard, [name]: value });
    };

    // 게시글 작성 핸들러
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newBoard.title || !newBoard.content) {
            alert('제목과 내용을 모두 입력해주세요.');
            return;
        }
        try {
            await createBoard(newBoard);
            setNewBoard({ title: '', content: '', author: 'testuser' }); // 폼 초기화
            fetchBoards(); // 목록 새로고침
        } catch (error) {
            console.error('게시글 작성 중 오류 발생:', error);
        }
    };

    return (
        <div style={{ padding: '20px' }}>
            <h1>게시판</h1>

            {/* 게시글 작성 폼 */}
            <form onSubmit={handleSubmit} style={{ marginBottom: '20px', border: '1px solid #ccc', padding: '10px' }}>
                <div>
                    <label>제목: </label>
                    <input
                        type="text"
                        name="title"
                        value={newBoard.title}
                        onChange={handleInputChange}
                        style={{ width: '300px', marginBottom: '10px' }}
                    />
                </div>
                <div>
                    <label>내용: </label>
                    <textarea
                        name="content"
                        value={newBoard.content}
                        onChange={handleInputChange}
                        rows="4"
                        style={{ width: '300px', marginBottom: '10px' }}
                    />
                </div>
                <button type="submit">작성</button>
            </form>

            {/* 게시글 목록 */}
            <div>
                <h2>게시글 목록</h2>
                {boards.length > 0 ? (
                    boards.map((board) => (
                        <div key={board.id} style={{ border: '1px solid #eee', padding: '10px', marginBottom: '10px' }}>
                            <h3>{board.title}</h3>
                            <p>작성자: {board.author}</p>
                            {/* XSS 취약점을 만들기 위해 dangerouslySetInnerHTML 사용 */}
                            <div dangerouslySetInnerHTML={{ __html: board.content }}></div>
                        </div>
                    ))
                ) : (
                    <p>게시글이 없습니다.</p>
                )}
            </div>
        </div>
    );
}

export default BoardPage;
