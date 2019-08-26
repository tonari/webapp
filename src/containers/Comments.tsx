import * as React from 'react';
import { connect } from 'react-redux';
import Typography from '@material-ui/core/Typography';
import FlagIcon from '@material-ui/icons/Flag';
import SubmitIcon from '@material-ui/icons/Send';

import { ApiBufferingState, addComment } from '../redux';
import * as api from '../api';
import styles from './Comments.module.css';
import SwipeView from '../components/SwipeView';
import SwipeResistibleOverflow from '../components/SwipeResistibleOverflow';
import moment from 'moment';

type State = {
  commentContent: string,
}

type Props = {
  comments?: ApiBufferingState['comments'],
  addComment?: typeof addComment,
  swipeView: SwipeView | null,
  id: api.Id,
}

class Comments extends React.PureComponent<Props, State> {
  state = {
    commentContent: '',
  }

  submit = (e: any) => {
    if (this.state.commentContent.length === 0) return;
    this.props.addComment!(this.state.commentContent);
    this.setState({ commentContent: '' });
  }

  render() {
    const comments: api.Comment[] = (() => {
      const maybe_comments = this.props.comments![api.idToStr(this.props.id)];
      if (maybe_comments !== undefined) {
        return maybe_comments;
      } else {
        return [];
      }
    })();

    return (
      <React.Fragment>
        <div className={styles.inputContainer}>
          <input
            placeholder='Comment...'
            type='input'
            className={styles.input}
            value={this.state.commentContent}
            onChange={e => this.setState({ commentContent: e.target.value })}
          />
          <div className={styles.buttonContainer}>
            <SubmitIcon onClick={this.submit} className={styles.button} />
          </div>
        </div>
        <SwipeResistibleOverflow swipeView={this.props.swipeView}>
          {
            comments.map((comment: api.Comment) => {
              const date: string = comment.timestamp.fromNow();

              return (
                <div className={styles.comment} key={comment.id}>
                  <div className={styles.header}>
                    <Typography className={styles.date}>{date}</Typography>
                    <FlagIcon className={styles.flagIcon} />
                  </div>
                  <Typography className={styles.content}>{comment.content}</Typography>
                </div>
              );
            })
          }
        </SwipeResistibleOverflow>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: any) => ({
  comments: state.apiBuffering.comments,
});

const mapDispatchToProps = {
  addComment,
};

export default connect<{}, {}, Props>(
  mapStateToProps,
  mapDispatchToProps,
)(Comments);
