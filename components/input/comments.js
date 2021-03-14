import { useEffect, useState, useContext } from 'react';

import CommentList from './comment-list';
import NewComment from './new-comment';
import NotificationContext from '../../store/notification-context';
import classes from './comments.module.css';

function Comments(props) {
	const { eventId } = props;
	const notificationCtx = useContext(NotificationContext);

	const [showComments, setShowComments] = useState(false);
	const [comments, setComments] = useState([]);
	const [isFetchingComment, setIsFetchingComment] = useState(false);

	useEffect(() => {
		if (showComments) {
			setIsFetchingComment(true);
			fetch('/api/comments/' + eventId)
				.then((response) => response.json())
				.then((data) => {
					setComments(data.comments);
					setIsFetchingComment(false);
				});
		}
	}, [showComments]);

	function toggleCommentsHandler() {
		setShowComments((prevStatus) => !prevStatus);
	}

	function addCommentHandler(commentData) {
		notificationCtx.showNotification({
			title: 'Adding Comment',
			message: 'Your comment is being added',
			status: 'pending',
		});
		fetch('/api/comments/' + eventId, {
			method: 'POST',
			body: JSON.stringify(commentData),
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then(async (response) => {
				if (response.ok) {
					return response.json();
				}

				const data = await response.json();
				throw new Error(data.message || 'Something went wrong');
			})
			.then(() => {
				notificationCtx.showNotification({
					title: 'Comment Added',
					message: 'Your comment has been added.',
					status: 'success',
				});
			})
			.catch((err) => {
				notificationCtx.showNotification({
					title: 'Failed!',
					message: err.message || 'Something went wrong.',
					status: 'error',
				});
			});
	}

	return (
		<section className={classes.comments}>
			<button onClick={toggleCommentsHandler}>
				{showComments ? 'Hide' : 'Show'} Comments
			</button>
			{showComments && <NewComment onAddComment={addCommentHandler} />}
			{showComments && !isFetchingComment && <CommentList items={comments} />}
			{showComments && isFetchingComment && <p>Loading...</p>}
		</section>
	);
}

export default Comments;
